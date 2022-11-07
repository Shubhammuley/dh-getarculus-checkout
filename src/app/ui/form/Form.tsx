import { memoizeOne } from '@bigcommerce/memoize';
import { Form as FormikForm, FormikFormProps } from 'formik';
import { values } from 'lodash';
import React, { createRef, memo, useCallback, useRef, FunctionComponent, Ref } from 'react';

import FormProvider, { FormContextType } from './FormProvider';

export interface FormProps extends FormikFormProps {
    testId?: string;
    id?: string;
    initialValues?: any;
    fromRef?: Ref<HTMLFieldSetElement>;
    callBackFunc?(formRef: any): void;
}

const Form: FunctionComponent<FormProps> = ({
    className,
    testId,
    // callBackFunc,
    // fromRef,
    ...rest
}) => {
    const ref = useRef({ containerRef: createRef<HTMLDivElement>() });
    // const fromRef = useRef({ containerRef: createRef<HTMLDivElement>() });

    const focusOnError = () => {
        const { current } = ref.current.containerRef;

        if (!current) {
            return;
        }

        const errorInputSelectors = [
            '.form-field--error input',
            '.form-field--error textarea',
            '.form-field--error select',
        ];

        const erroredFormField = current.querySelector<HTMLElement>(errorInputSelectors.join(', '));

        if (erroredFormField) {
            erroredFormField.focus({preventScroll: true});
            try {
                erroredFormField.offsetParent?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center'});
            } catch {
                erroredFormField.offsetParent?.scrollIntoView();
            }
        }
    };

    const handleSubmitCapture = useCallback(memoizeOne((setSubmitted: FormContextType['setSubmitted']) => {
        return () => {
            setSubmitted(true);

            // use timeout to allow Formik validation to happen
            setTimeout(() => focusOnError());
        };
    }), [focusOnError]);

    // useEffect(() => {
    //     if (callBackFunc) {
    //         callBackFunc(fromRef);
    //     }
    // } , [callBackFunc]);

    const renderContent = useCallback(memoizeOne(({ setSubmitted }: FormContextType) => {
        return (
            <div ref={ ref.current.containerRef }>
                {/* { console.log({ ...rest }) } */}
                <FormikForm
                    { ...rest }
                    className={ className }
                    data-test={ testId }
                    // innerRef={ fromRef }
                    noValidate
                    onSubmitCapture={ handleSubmitCapture(setSubmitted) }
                />
            </div>
        );
    }), [
        className,
        handleSubmitCapture,
        testId,
        ...values(rest),
    ]);

    return (
        <FormProvider>
            { renderContent }
        </FormProvider>
    );
};

export default memo(Form);
