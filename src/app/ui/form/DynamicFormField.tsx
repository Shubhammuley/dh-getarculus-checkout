import { FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import { FieldProps } from 'formik';
import React, { memo, useCallback, useLayoutEffect, useMemo, useState, FunctionComponent, ReactNode } from 'react';

import { TranslatedString } from '../../locale';

import CheckboxGroupFormField from './CheckboxGroupFormField';
import DynamicFormFieldType from './DynamicFormFieldType';
import DynamicInput from './DynamicInput';
import FormField from './FormField';
import Label from './Label';

export interface DynamicFormFieldOption {
    code: string;
    name: string;
}

export interface DynamicFormFieldProps {
    field: FormFieldType;
    inputId?: string;
    extraClass?: string;
    autocomplete?: string;
    parentFieldName?: string;
    placeholder?: string;
    label?: ReactNode;
    showErrorInState?: boolean;
    onBlur?: any;
    onChange?(value: string | string[]): void;
    setFieldValue?(fieldName: string, value: string | string[]): void;
}

const DynamicFormField: FunctionComponent<DynamicFormFieldProps>  = ({
    field: {
        fieldType,
        type,
        secret,
        name,
        label: fieldLabel,
        required,
        options,
        max,
        min,
        maxLength,
    },
    parentFieldName,
    onChange,
    setFieldValue,
    placeholder,
    inputId,
    autocomplete,
    label,
    onBlur,
    extraClass,
    showErrorInState,
}) => {
    const fieldInputId = inputId || name;
    const fieldName = parentFieldName ? `${parentFieldName}.${name}` : name;

    const [inputValue, setInputValue] = useState('');

    const labelComponent = useMemo(() => (
        <Label htmlFor={ fieldInputId }>
            { label || fieldLabel }
            { !required &&
                <>
                    { ' ' }
                    <small className="optimizedCheckout-contentSecondary">
                        <TranslatedString id="common.optional_text" />
                    </small>
                </> }
        </Label>
    ), [
        fieldInputId,
        fieldLabel,
        required,
        label,
    ]);

    const dynamicFormFieldType = useMemo((): DynamicFormFieldType => {
        if (fieldType === 'text') {
            if (type === 'integer') {
                return DynamicFormFieldType.number;
            }

            return secret ?
                DynamicFormFieldType.password :
                DynamicFormFieldType.text;
        }

        return fieldType as DynamicFormFieldType;
    }, [fieldType, type, secret]);

    // eslint-disable-next-line @typescript-eslint/tslint/config
    const onChangeInput = (value: string) => {
        setInputValue(value);
        if (value && onChange) {
            onChange(value);
        }
    };

    const renderInput = useCallback(({ field }: FieldProps<string>) => {
        return (
            <DynamicInput
                { ...field }
                additionalClassName= { `${inputValue ? 'filled' : ''}` }
                autoComplete={ autocomplete }
                fieldType={ dynamicFormFieldType }
                id={ fieldInputId }
                max={ max }
                maxLength={ maxLength || undefined }
                min={ min }
                onBlur= { onBlur }
                options={ options && options.items }
                placeholder={ placeholder || (options && options.helperLabel) }
                rows={ options && (options as any).rows }
                setFieldValue={ setFieldValue }
                showErrorInState={ showErrorInState }
            />
        );
    }, [autocomplete, dynamicFormFieldType, fieldInputId, max, maxLength, min, options, placeholder, setFieldValue, inputValue]);

    useLayoutEffect(() => {
        const targetInputElement: any | null = document.querySelector(`.form-field input[id="${fieldInputId}"]`) || document.querySelector(`.form-field textarea[id="${fieldInputId}"]`);
        if (targetInputElement) {
            const targetParent: any | null = targetInputElement.closest('.form-field');
            targetParent && targetInputElement.value !== '' && targetParent.classList.add('floating-label');
        }
    });

    return (
        <div className={ `dynamic-form-field ${extraClass}` }>
            { fieldType === DynamicFormFieldType.checkbox ?
                <CheckboxGroupFormField
                    id={ fieldInputId }
                    label={ labelComponent }
                    name={ fieldName }
                    onChange={ onChange }
                    options={ (options && options.items) || [] }
                /> :
                <FormField
                    additionalClassName={ fieldType === 'dropdown' ? 'floating-label' : '' }
                    input={ renderInput }
                    label={ labelComponent }
                    name={ fieldName }
                    onChange={ onChangeInput }
                /> }
        </div>
    );
};

export default memo(DynamicFormField);
