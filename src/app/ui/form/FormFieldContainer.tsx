import classNames from 'classnames';
import React, { memo, FunctionComponent, ReactNode } from 'react';

import { FormContext } from './FormProvider';

export interface FormFieldContainerProps {
    additionalClassName?: string;
    children: ReactNode;
    className?: string;
    hasError?: boolean;
    testId?: string;
}

const FormFieldContainer: FunctionComponent<FormFieldContainerProps> = ({
    additionalClassName,
    children,
    className,
    hasError,
    testId,
}) => (
    <FormContext.Consumer>
        { ({ isSubmitted }) => (
            <div
                className={ className ? className : classNames(
                    'form-field',
                    additionalClassName,
                    { 'form-field--error': hasError && isSubmitted }
                ) }
                data-test={ testId }
                id={ testId }
            >
                { children }
            </div>
        ) }
    </FormContext.Consumer>
);

export default memo(FormFieldContainer);
