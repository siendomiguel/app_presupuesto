'use client';

import { useCallback, useRef, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { parseCSV } from '@/lib/csv-parser';
import {
  ColumnMapping,
  DefaultValues,
  detectColumnMapping,
  findUnknownCategories,
  processCSVRows,
  importTransactions,
  ImportResult,
} from '@/lib/services/csv-import';
import { categoriesService } from '@/lib/services/categories';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Upload from 'lucide-react/dist/esm/icons/upload';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle';
import Plus from 'lucide-react/dist/esm/icons/plus';
import { toast } from 'sonner';

type Step = 'upload' | 'preview' | 'resolve' | 'importing' | 'done';

const FIELD_OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: '_skip', label: '— Omitir —', hint: 'Esta columna no se usara en la importacion' },
  { value: 'date', label: 'Fecha', hint: 'Fecha de la transaccion. Ej: 31/1/2026, 2026-01-31' },
  {
    value: 'description',
    label: 'Descripcion',
    hint: 'Nombre o detalle de la transaccion. Ej: Compra supermercado, Pago Netflix',
  },
  {
    value: 'type',
    label: 'Tipo',
    hint: 'Si es ingreso, gasto o transferencia. Valores: income, expense, transfer (o ingreso, gasto, transferencia)',
  },
  { value: 'amount', label: 'Monto', hint: 'Valor numerico de la transaccion. Ej: 15900, $15.900,00, 50000' },
  { value: 'currency', label: 'Moneda', hint: 'Moneda de la transaccion. Valores: USD o COP' },
  {
    value: 'category',
    label: 'Categoria',
    hint: 'Nombre de la categoria (debe existir en tu cuenta). Ej: Mercado, Salud, Entretenimiento',
  },
  {
    value: 'account',
    label: 'Cuenta',
    hint: 'Nombre de la cuenta o metodo de pago (debe existir en tu cuenta). Ej: Bancolombia, Efectivo',
  },
  {
    value: 'merchant',
    label: 'Comercio',
    hint: 'Nombre del establecimiento o tienda (opcional). Ej: Burger King, Exito, Netflix',
  },
  {
    value: 'notes',
    label: 'Notas',
    hint: 'Comentarios adicionales (opcional). Ej: Pago mensual, Compra con descuento',
  },
];

const FIELD_LABELS: Record<string, string> = {
  date: 'Fecha',
  description: 'Descripcion',
  type: 'Tipo',
  amount: 'Monto',
  currency: 'Moneda',
  category: 'Categoria',
  account: 'Cuenta',
  merchant: 'Comercio',
  notes: 'Notas',
};

const FIELD_HINTS: Record<string, string> = {
  date: 'Fecha de la transaccion. Ej: 31/1/2026',
  description: 'Nombre o detalle. Ej: Compra supermercado',
  type: 'income (ingreso), expense (gasto) o transfer',
  amount: 'Valor numerico. Ej: 15900, $15.900,00',
  currency: 'USD o COP',
  category: 'Nombre de la categoria. Ej: Mercado, Salud',
  account: 'Nombre de la cuenta. Ej: Bancolombia, Efectivo',
  merchant: 'Establecimiento o tienda. Ej: Burger King, Exito',
  notes: 'Comentarios adicionales (opcional)',
};

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const emptyMapping: ColumnMapping = {
  date: null,
  description: null,
  type: null,
  amount: null,
  currency: null,
  category: null,
  account: null,
  merchant: null,
  notes: null,
};

const emptyDefaults: DefaultValues = { type: '', currency: '', account_id: '' };

// Resolution for an unknown category: map to existing or create new
interface CategoryResolution {
  action: 'existing' | 'create' | 'skip';
  categoryId?: string; // for 'existing'
  newName?: string; // for 'create'
  newType?: 'income' | 'expense'; // for 'create'
}

export function CSVImportDialog({ open, onOpenChange, onSuccess }: CSVImportDialogProps) {
  const { user } = useUser();
  const { accounts } = useAccounts(user?.id);
  const { categories, refetch: refetchCategories } = useCategories(user?.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({ ...emptyMapping });
  const [defaults, setDefaults] = useState<DefaultValues>({ ...emptyDefaults });
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Category resolution state
  const [unknownCategories, setUnknownCategories] = useState<string[]>([]);
  const [categoryResolutions, setCategoryResolutions] = useState<Record<string, CategoryResolution>>({});
  const [creatingCategories, setCreatingCategories] = useState(false);

  const reset = useCallback(() => {
    setStep('upload');
    setHeaders([]);
    setRows([]);
    setMapping({ ...emptyMapping });
    setDefaults({ ...emptyDefaults });
    setProgress(0);
    setResult(null);
    setUnknownCategories([]);
    setCategoryResolutions({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.headers.length === 0) {
        toast.error('No se pudo leer el archivo CSV');
        return;
      }
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setMapping(detectColumnMapping(parsed.headers));
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.csv')) {
      toast.error('Solo se aceptan archivos .csv');
      return;
    }
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const updateMapping = (field: keyof ColumnMapping, colIndex: number | null) => {
    setMapping(prev => {
      const next = { ...prev };
      for (const key of Object.keys(next) as Array<keyof ColumnMapping>) {
        if (next[key] === colIndex && key !== field) {
          next[key] = null;
        }
      }
      next[field] = colIndex;
      return next;
    });
  };

  const getMappingForColumn = (colIndex: number): string => {
    for (const [key, val] of Object.entries(mapping)) {
      if (val === colIndex) return key;
    }
    return '_skip';
  };

  const requiredFields: (keyof ColumnMapping)[] = ['date', 'description', 'type', 'amount', 'currency', 'account'];
  const missingRequired = requiredFields.filter(f => {
    if (mapping[f] !== null) return false;
    if (f === 'type' && defaults.type) return false;
    if (f === 'currency' && defaults.currency) return false;
    if (f === 'account' && defaults.account_id) return false;
    return true;
  });

  // After preview step: check for unknown categories before importing
  const handleProceed = () => {
    const unknown = findUnknownCategories(rows, mapping, categories);
    if (unknown.length > 0) {
      setUnknownCategories(unknown);
      // Initialize resolutions
      const resolutions: Record<string, CategoryResolution> = {};
      unknown.forEach(name => {
        resolutions[name] = { action: 'create', newName: name, newType: 'expense' };
      });
      setCategoryResolutions(resolutions);
      setStep('resolve');
    } else {
      doImport();
    }
  };

  const updateResolution = (name: string, resolution: Partial<CategoryResolution>) => {
    setCategoryResolutions(prev => ({
      ...prev,
      [name]: { ...prev[name], ...resolution },
    }));
  };

  const allResolved = unknownCategories.every(name => {
    const r = categoryResolutions[name];
    if (!r) return false;
    if (r.action === 'existing') return !!r.categoryId;
    if (r.action === 'create') return !!r.newName?.trim();
    if (r.action === 'skip') return true;
    return false;
  });

  const handleResolveAndImport = async () => {
    if (!user?.id) return;
    setCreatingCategories(true);

    try {
      // Create new categories first
      const overrides = new Map<string, string>();

      for (const name of unknownCategories) {
        const r = categoryResolutions[name];
        if (r.action === 'existing' && r.categoryId) {
          overrides.set(name.toLowerCase(), r.categoryId);
        } else if (r.action === 'create' && r.newName?.trim()) {
          const created = await categoriesService.createCategory({
            user_id: user.id,
            name: r.newName.trim(),
            type: r.newType || 'expense',
          } as any) as any;
          overrides.set(name.toLowerCase(), created.id);
        }
        // 'skip' → no override, category will be null
      }

      setCreatingCategories(false);
      refetchCategories();
      doImport(overrides);
    } catch (err) {
      setCreatingCategories(false);
      toast.error('Error al crear categorias');
      console.error(err);
    }
  };

  const doImport = async (categoryOverrides?: Map<string, string>) => {
    if (!user?.id) return;

    setStep('importing');
    setProgress(0);

    const { valid, errors: validationErrors } = processCSVRows(
      rows, mapping, defaults, accounts, categories, user.id, categoryOverrides
    );

    if (valid.length === 0) {
      setResult({ imported: 0, errors: validationErrors });
      setStep('done');
      return;
    }

    const importResult = await importTransactions(valid, (current, total) => {
      setProgress(Math.round((current / total) * 100));
    });

    const finalResult: ImportResult = {
      imported: importResult.imported,
      errors: [...validationErrors, ...importResult.errors],
    };

    setResult(finalResult);
    setStep('done');

    if (finalResult.imported > 0) {
      toast.success(`${finalResult.imported} transacciones importadas`);
      onSuccess?.();
    }
  };

  const previewRows = rows.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar CSV
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Selecciona un archivo CSV con tus transacciones'}
            {step === 'preview' && 'Mapea las columnas y configura valores por defecto'}
            {step === 'resolve' && 'Algunas categorias del CSV no existen. Resuelvelas antes de importar.'}
            {step === 'importing' && 'Importando transacciones...'}
            {step === 'done' && 'Importacion completada'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}>
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Arrastra un archivo CSV aqui o haz clic para seleccionar</p>
            <p className="text-xs text-muted-foreground">
              Compatible con cualquier CSV. Podras mapear las columnas en el siguiente paso.
            </p>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </div>
        )}

        {/* Step 2: Preview & Mapping */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">{rows.length} filas encontradas</div>

            {/* Column mapping */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Mapeo de columnas</h4>
              <p className="text-xs text-muted-foreground">
                Selecciona a que campo de Fintrack corresponde cada columna de tu CSV
              </p>
              <TooltipProvider delayDuration={200}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {headers.map((header, colIdx) => {
                    const currentMapping = getMappingForColumn(colIdx);
                    const isMapped = currentMapping !== '_skip';
                    return (
                      <div key={colIdx} className="space-y-1">
                        <div className="flex items-center gap-1">
                          <label className="text-xs font-medium truncate" title={header}>
                            {header}
                          </label>
                          {isMapped && FIELD_HINTS[currentMapping] && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help shrink-0">
                                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs">
                                <p className="font-medium mb-0.5">{FIELD_LABELS[currentMapping]}</p>
                                <p className="text-muted-foreground">{FIELD_HINTS[currentMapping]}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <Select
                          value={currentMapping}
                          onValueChange={val => {
                            if (val === '_skip') {
                              setMapping(prev => {
                                const next = { ...prev };
                                for (const key of Object.keys(next) as Array<keyof ColumnMapping>) {
                                  if (next[key] === colIdx) next[key] = null;
                                }
                                return next;
                              });
                            } else {
                              updateMapping(val as keyof ColumnMapping, colIdx);
                            }
                          }}>
                          <SelectTrigger className={`h-8 text-xs ${isMapped ? 'border-primary/50 bg-primary/5' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                <div>
                                  <span>{opt.label}</span>
                                  {opt.value !== '_skip' && (
                                    <span className="block text-[10px] text-muted-foreground leading-tight mt-0.5">
                                      {opt.hint}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>

            {/* Default values for unmapped required fields */}
            {(mapping.type === null || mapping.currency === null || mapping.account === null) && (
              <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                <h4 className="text-sm font-medium">Valores por defecto</h4>
                <p className="text-xs text-muted-foreground">
                  Para campos sin columna en el CSV, asigna un valor fijo para todas las filas
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {mapping.type === null && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Tipo</label>
                      <Select
                        value={defaults.type || '_empty'}
                        onValueChange={val =>
                          setDefaults(prev => ({
                            ...prev,
                            type: val === '_empty' ? '' : (val as DefaultValues['type']),
                          }))
                        }>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_empty" className="text-xs">— Sin asignar —</SelectItem>
                          <SelectItem value="expense" className="text-xs">Gasto</SelectItem>
                          <SelectItem value="income" className="text-xs">Ingreso</SelectItem>
                          <SelectItem value="transfer" className="text-xs">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {mapping.currency === null && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Moneda</label>
                      <Select
                        value={defaults.currency || '_empty'}
                        onValueChange={val =>
                          setDefaults(prev => ({
                            ...prev,
                            currency: val === '_empty' ? '' : (val as DefaultValues['currency']),
                          }))
                        }>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_empty" className="text-xs">— Sin asignar —</SelectItem>
                          <SelectItem value="COP" className="text-xs">COP</SelectItem>
                          <SelectItem value="USD" className="text-xs">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {mapping.account === null && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Cuenta</label>
                      <Select
                        value={defaults.account_id || '_empty'}
                        onValueChange={val =>
                          setDefaults(prev => ({ ...prev, account_id: val === '_empty' ? '' : val }))
                        }>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_empty" className="text-xs">— Sin asignar —</SelectItem>
                          {accounts.map(a => (
                            <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Missing required fields warning */}
            {missingRequired.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Campos requeridos sin asignar: {missingRequired.map(f => FIELD_LABELS[f] || f).join(', ')}. Mapea una
                  columna o selecciona un valor por defecto.
                </span>
              </div>
            )}

            {/* Preview table */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Vista previa</h4>
              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((h, i) => {
                        const mapped = getMappingForColumn(i);
                        return (
                          <TableHead key={i} className="text-xs whitespace-nowrap">
                            <div>{h}</div>
                            {mapped !== '_skip' && (
                              <div className="text-[10px] text-primary font-normal">
                                → {FIELD_LABELS[mapped] || mapped}
                              </div>
                            )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, ri) => (
                      <TableRow key={ri}>
                        {headers.map((_, ci) => (
                          <TableCell key={ci} className="text-xs whitespace-nowrap py-1.5">
                            {row[ci] ?? ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {rows.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">Mostrando 5 de {rows.length} filas</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2.5: Resolve unknown categories */}
        {step === 'resolve' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  {unknownCategories.length} {unknownCategories.length === 1 ? 'categoria no encontrada' : 'categorias no encontradas'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Para cada una, elige una categoria existente, crea una nueva o dejala sin categoria.
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {unknownCategories.map(name => {
                const r = categoryResolutions[name] || { action: 'create', newName: name, newType: 'expense' };
                return (
                  <div key={name} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">&ldquo;{name}&rdquo;</p>
                      <Select
                        value={r.action}
                        onValueChange={val => updateResolution(name, { action: val as CategoryResolution['action'] })}
                      >
                        <SelectTrigger className="h-8 text-xs w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="create" className="text-xs">Crear categoria nueva</SelectItem>
                          <SelectItem value="existing" className="text-xs">Usar categoria existente</SelectItem>
                          <SelectItem value="skip" className="text-xs">Dejar sin categoria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {r.action === 'existing' && (
                      <Select
                        value={r.categoryId || '_empty'}
                        onValueChange={val => updateResolution(name, { categoryId: val === '_empty' ? undefined : val })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Selecciona categoria..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_empty" className="text-xs">— Seleccionar —</SelectItem>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">
                              {c.name} ({c.type === 'income' ? 'Ingreso' : 'Gasto'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {r.action === 'create' && (
                      <div className="flex gap-2">
                        <Input
                          className="h-8 text-xs flex-1"
                          placeholder="Nombre de la nueva categoria"
                          value={r.newName ?? name}
                          onChange={e => updateResolution(name, { newName: e.target.value })}
                        />
                        <Select
                          value={r.newType || 'expense'}
                          onValueChange={val => updateResolution(name, { newType: val as 'income' | 'expense' })}
                        >
                          <SelectTrigger className="h-8 text-xs w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense" className="text-xs">Gasto</SelectItem>
                            <SelectItem value="income" className="text-xs">Ingreso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Importing */}
        {step === 'importing' && (
          <div className="py-6 space-y-3">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">{progress}% completado</p>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 'done' && result && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              {result.imported > 0 ? (
                <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
              )}
              <div>
                <p className="font-medium">{result.imported} transacciones importadas</p>
                {result.errors.length > 0 && (
                  <p className="text-sm text-muted-foreground">{result.errors.length} errores</p>
                )}
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-16">Fila</TableHead>
                      <TableHead className="text-xs">Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.errors.map((err, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs py-1.5">{err.row}</TableCell>
                        <TableCell className="text-xs py-1.5">{err.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'preview' && (
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={reset}>
                Volver
              </Button>
              <Button onClick={handleProceed} disabled={missingRequired.length > 0} className="gap-1.5">
                <Upload className="h-4 w-4" />
                Importar {rows.length} filas
              </Button>
            </div>
          )}
          {step === 'resolve' && (
            <div className="flex gap-2 w-full justify-between">
              <Button variant="outline" onClick={() => setStep('preview')}>
                Volver
              </Button>
              <Button
                onClick={handleResolveAndImport}
                disabled={!allResolved || creatingCategories}
                className="gap-1.5"
              >
                {creatingCategories ? (
                  'Creando categorias...'
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Resolver e importar
                  </>
                )}
              </Button>
            </div>
          )}
          {step === 'done' && <Button onClick={() => handleClose(false)}>Cerrar</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
