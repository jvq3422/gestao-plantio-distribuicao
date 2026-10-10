import React, { useState, useEffect } from 'react';

interface DecimalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | undefined;
  onChange: (value: number) => void;
  allowNegative?: boolean;
}

/**
 * Componente de entrada numérica decimal otimizado para teclado brasileiro (vírgula e ponto),
 * touch screens e digitação fluida sem apagar o separador decimal enquanto digita.
 */
export const DecimalInput: React.FC<DecimalInputProps> = ({
  value,
  onChange,
  allowNegative = false,
  className,
  placeholder,
  disabled,
  ...rest
}) => {
  const formatInitial = (val: number | undefined): string => {
    if (val === undefined || val === null || isNaN(val)) return '';
    return String(val);
  };

  const [textValue, setTextValue] = useState<string>(() => formatInitial(value));

  // Sincroniza se o valor mudar externamente (por exemplo, reset ou cálculo programático)
  useEffect(() => {
    const currentNum = parseFloat(textValue.replace(',', '.'));
    if (value === undefined || value === null || isNaN(value)) {
      if (textValue !== '') setTextValue('');
    } else if (isNaN(currentNum) || Math.abs(currentNum - value) > 0.000001) {
      // Só atualiza se houver diferença real, evitando interromper a digitação de "5." ou "5,"
      setTextValue(String(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;

    // Normaliza múltiplos separadores
    raw = raw.replace(/[^0-9.,-]/g, '');
    if (!allowNegative) {
      raw = raw.replace(/-/g, '');
    }

    setTextValue(raw);

    // Se estiver vazio ou for apenas um sinal de menos/ponto/vírgula, não quebra o formulário
    if (raw === '' || raw === '-' || raw === '.' || raw === ',') {
      onChange(0);
      return;
    }

    // Converte vírgula para ponto e converte para número
    const normalized = raw.replace(',', '.');
    const parsed = parseFloat(normalized);

    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (textValue === '' || textValue === '-' || textValue === '.' || textValue === ',') {
      setTextValue('0');
      onChange(0);
    } else {
      const parsed = parseFloat(textValue.replace(',', '.'));
      if (!isNaN(parsed)) {
        setTextValue(String(parsed));
        onChange(parsed);
      }
    }
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={textValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      {...rest}
    />
  );
};
