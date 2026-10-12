import React from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input, PasswordInput, Textarea } from '../ui/Input';

/** Generic React Hook Form <-> RN <Input> glue, reused across every form screen. */
export function ControlledInput<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: {
  control: Control<T>;
  name: Path<T>;
} & React.ComponentProps<typeof Input>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Input
          value={typeof value === 'string' ? value : (value ?? '')}
          onChangeText={onChange}
          onBlur={onBlur}
          autoCapitalize="none"
          {...inputProps}
        />
      )}
    />
  );
}

export function ControlledPasswordInput<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: {
  control: Control<T>;
  name: Path<T>;
} & React.ComponentProps<typeof PasswordInput>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <PasswordInput
          value={typeof value === 'string' ? value : (value ?? '')}
          onChangeText={onChange}
          onBlur={onBlur}
          autoCapitalize="none"
          {...inputProps}
        />
      )}
    />
  );
}

export function ControlledTextarea<T extends FieldValues>({
  control,
  name,
  ...inputProps
}: {
  control: Control<T>;
  name: Path<T>;
} & React.ComponentProps<typeof Textarea>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Textarea
          value={typeof value === 'string' ? value : (value ?? '')}
          onChangeText={onChange}
          onBlur={onBlur}
          {...inputProps}
        />
      )}
    />
  );
}
