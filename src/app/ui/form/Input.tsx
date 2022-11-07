import React, { forwardRef, InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    testId?: string;
    onBlur?: any;
}

const labelOnFocus = (event: any) => {
    event.target.closest('.form-field').classList.add('floating-label');
};

const labelOnBlur = (event: any, onBlur: any) => {
    const targetElement = event.target.closest('.form-field');
    if (targetElement) {
        const value = event.target.value;
        (value && value !== '')
            ? targetElement.classList.add('floating-label')
            : targetElement.classList.remove('floating-label');
    }
    if (onBlur) {
        onBlur();
    }
};

const Input = forwardRef((
    { testId, onBlur,  ...rest }: InputProps,
    ref: Ref<HTMLInputElement>
) => (
    <input
        { ...rest }
        data-test={ testId }
        ref={ ref }
        onFocus={ (event) => labelOnFocus(event) }
        onBlur={ (event) => labelOnBlur(event, onBlur) }
    />
));

export default Input;
