import { FieldProps } from 'formik';
import React, { memo, useCallback, useEffect, useMemo, FunctionComponent } from 'react';

import { TranslatedString } from '../locale';
import { FormField, TextInput } from '../ui/form';

export interface EmailFieldProps {
    className?: string;
    onChange?(value: string): void;
}

const EmailField: FunctionComponent<EmailFieldProps>  = ({
    onChange,
    className,
}) => {

    const labelContent = useMemo(() => (
        <TranslatedString id="customer.email_label" />
    ), []);

    useEffect(() => {
       const input = document.getElementById('email') as HTMLInputElement;
       if (input?.value) {
           const formDiv = document.getElementById('email-form');
           if (formDiv) {
               formDiv.classList.add('floating-label');
           }
       }
    }, []);
    const renderInput = useCallback((props: FieldProps) => {
        const formFields = { ...props.field, required: true };

        return (
            <TextInput
                { ...formFields }
                additionalClassName={ className }
                autoComplete={ props.field.name }
                id={ props.field.name }
                // placeholder="Email Address"
                type="email"
            />
        );
    }, [className]);

    return <FormField
        input={ renderInput }
        labelContent={ labelContent }
        name="email"
        onChange={ onChange }
        testId="email-form"
    />;
};

export default memo(EmailField);
