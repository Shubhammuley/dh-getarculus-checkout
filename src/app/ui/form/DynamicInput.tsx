import { FormFieldItem } from '@bigcommerce/checkout-sdk';
import { isDate, noop } from 'lodash';
import React, { memo, useCallback, useEffect, FunctionComponent } from 'react';
import ReactDatePicker from 'react-datepicker';
import Select from 'react-select';

import { withDate, WithDateProps } from '../../locale';

import CheckboxInput from './CheckboxInput';
import DynamicFormFieldType from './DynamicFormFieldType';
import { InputProps } from './Input';
import RadioInput from './RadioInput';
import TextArea from './TextArea';
import TextInput from './TextInput';

export interface DynamicInputProps extends InputProps {
    id: string;
    additionalClassName?: string;
    value?: string | string[];
    rows?: number;
    fieldType?: DynamicFormFieldType;
    options?: FormFieldItem[];
    showErrorInState?: boolean;
    onBlur?: any;
    setFieldValue?(fieldName: string, value: string | string[]): void;
}

// eslint-disable-next-line @typescript-eslint/tslint/config
const DynamicInput: FunctionComponent<DynamicInputProps & WithDateProps> = ({
    additionalClassName,
    date,
    fieldType,
    id,
    name,
    onChange = noop,
    options,
    placeholder,
    value,
    setFieldValue,
    onBlur,
    // showErrorInState,
    ...rest
}) => {
    const { inputFormat } = date;
    // const [showError, setShowError] = useState(false);
    const handleDateChange = useCallback((dateValue, event) => onChange({
        ...event,
        target: {
            name,
            value: dateValue,
        },
    }), [
        onChange,
        name,
    ]);

    const hiddenSelect: any = React.createRef();
    const handleChangeOfFakeSelect = (selectedOption: any) => {
        // console.log(selectedOption);
        if (name === 'shippingAddress.stateOrProvinceCode' && ['HI', 'PR'].includes(selectedOption.value)) {
            // setShowError(true);
            const div = document.getElementsByClassName('checkout-address');
            const errorDiv = document.getElementById('state-error-message');
            if (div && div.length && !errorDiv) {
                const cityParentDiv = document.getElementsByClassName('dynamic-form-field--city');
                const cityChild = cityParentDiv[0].childNodes[0] as HTMLElement;
                if (cityChild) {
                    cityChild.classList.add('state-error');
                }
                const addressLine1ParentDiv = document.getElementsByClassName('dynamic-form-field--addressLine1');
                const addressLine1Child = addressLine1ParentDiv[0].childNodes[0] as HTMLElement;
                if (addressLine1Child) {
                    addressLine1Child.classList.add('state-error');
                }
                const provinceCodeParentDiv = document.getElementsByClassName('dynamic-form-field--provinceCode');
                const provinceCodeChild = provinceCodeParentDiv[0].childNodes[0] as HTMLElement;
                if (provinceCodeChild) {
                    provinceCodeChild.classList.add('state-error');
                }
                const postCodeParentDiv = document.getElementsByClassName('dynamic-form-field--postCode');
                const postCodeChild = postCodeParentDiv[0].childNodes[0] as HTMLElement;
                if (postCodeChild) {
                    postCodeChild.classList.add('state-error');
                }
                const node = document.createElement('div');
                node.innerText = 'Orders from Hawaii and Puerto Rico will not be accepted at this time.';
                node.classList.add('state-error-message');
                node.id = 'state-error-message';
                div[0].appendChild(node);
            }
        } else {
            const errorDiv = document.getElementById('state-error-message');
            if (errorDiv) {
                errorDiv.remove();
                const cityParentDiv = document.getElementsByClassName('dynamic-form-field--city');
                const cityChild = cityParentDiv[0].childNodes[0] as HTMLElement;
                if (cityChild) {
                    cityChild.classList.remove('state-error');
                    cityChild.classList.add('state-success');
                }
                const addressLine1ParentDiv = document.getElementsByClassName('dynamic-form-field--addressLine1');
                const addressLine1Child = addressLine1ParentDiv[0].childNodes[0] as HTMLElement;
                if (addressLine1Child) {
                    addressLine1Child.classList.remove('state-error');
                    addressLine1Child.classList.add('state-success');
                }
                const provinceCodeParentDiv = document.getElementsByClassName('dynamic-form-field--provinceCode');
                const provinceCodeChild = provinceCodeParentDiv[0].childNodes[0] as HTMLElement;
                if (provinceCodeChild) {
                    provinceCodeChild.classList.remove('state-error');
                    provinceCodeChild.classList.add('state-success');
                }
                const postCodeParentDiv = document.getElementsByClassName('dynamic-form-field--postCode');
                const postCodeChild = postCodeParentDiv[0].childNodes[0] as HTMLElement;
                if (postCodeChild) {
                    postCodeChild.classList.remove('state-error');
                    postCodeChild.classList.add('state-success');
                }
            }
            // setShowError(false);
        }
        // eslint-disable-next-line @typescript-eslint/tslint/config
        typeof setFieldValue !== 'undefined' && setFieldValue(hiddenSelect.current.name, selectedOption.value);
        hiddenSelect.current.value = selectedOption.value;
        const nativeInputValueSetter = (Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value') as any).set;
        nativeInputValueSetter.call(hiddenSelect.current, selectedOption.value);
        const ev2 = new Event('change', { bubbles: true});
        hiddenSelect.current.dispatchEvent(ev2);
    };

    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            borderBottom: '1px solid #000',
            color: state.isSelected ? '#fff' : '#000',
            backgroundColor: state.isSelected ? '#000' : '#fff',
            padding: 10,
        }),
        singleValue: (provided: any, state: any) => {
            const opacity = state.isDisabled ? 0.5 : 1;
            const transition = 'opacity 300ms';

            return { ...provided, opacity, transition };
        },
    };

    const filterOption = ({ label }: any, input: any) => {
        const length = input.length;

        if (label.slice(0, length).toLowerCase() === input.toLowerCase()) {
           return true;
        } else {
            return false;
        }
    };
    useEffect(() => {
        if (name === 'shippingAddress.stateOrProvinceCode') {
          if (['HI', 'PR'].includes(value as string)) {
            // setShowError(true);
            const div = document.getElementsByClassName('checkout-address');
            const errorDiv = document.getElementById('state-error-message');
            if (div && div.length && !errorDiv) {
                const node = document.createElement('div');
                node.innerText = 'Orders from Hawaii and Puerto Rico will not be accepted at this time.';
                node.classList.add('state-error-message');
                node.id = 'state-error-message';
                div[0].appendChild(node);
                const cityParentDiv = document.getElementsByClassName('dynamic-form-field--city');
                const cityChild = cityParentDiv[0].childNodes[0] as HTMLElement;
                if (cityChild) {
                    cityChild.classList.add('state-error');
                }
                const addressLine1ParentDiv = document.getElementsByClassName('dynamic-form-field--addressLine1');
                const addressLine1Child = addressLine1ParentDiv[0].childNodes[0] as HTMLElement;
                if (addressLine1Child) {
                    addressLine1Child.classList.add('state-error');
                }
                const provinceCodeParentDiv = document.getElementsByClassName('dynamic-form-field--provinceCode');
                const provinceCodeChild = provinceCodeParentDiv[0].childNodes[0] as HTMLElement;
                if (provinceCodeChild) {
                    provinceCodeChild.classList.add('state-error');
                }
                const postCodeParentDiv = document.getElementsByClassName('dynamic-form-field--postCode');
                const postCodeChild = postCodeParentDiv[0].childNodes[0] as HTMLElement;
                if (postCodeChild) {
                    postCodeChild.classList.add('state-error');
                }
            }
          } else {
            const errorDiv = document.getElementById('state-error-message');
            if (errorDiv) {
                errorDiv.remove();
                const cityParentDiv = document.getElementsByClassName('dynamic-form-field--city');
                const cityChild = cityParentDiv[0].childNodes[0] as HTMLElement;
                if (cityChild) {
                    cityChild.classList.remove('state-error');
                    cityChild.classList.add('state-success');
                }
                const addressLine1ParentDiv = document.getElementsByClassName('dynamic-form-field--addressLine1');
                const addressLine1Child = addressLine1ParentDiv[0].childNodes[0] as HTMLElement;
                if (addressLine1Child) {
                    addressLine1Child.classList.remove('state-error');
                    addressLine1Child.classList.add('state-success');
                }
                const provinceCodeParentDiv = document.getElementsByClassName('dynamic-form-field--provinceCode');
                const provinceCodeChild = provinceCodeParentDiv[0].childNodes[0] as HTMLElement;
                if (provinceCodeChild) {
                    provinceCodeChild.classList.remove('state-error');
                    provinceCodeChild.classList.add('state-success');
                }
                const postCodeParentDiv = document.getElementsByClassName('dynamic-form-field--postCode');
                const postCodeChild = postCodeParentDiv[0].childNodes[0] as HTMLElement;
                if (postCodeChild) {
                    postCodeChild.classList.remove('state-error');
                    postCodeChild.classList.add('state-success');
                }
            }
            // setShowError(false);
          }
        }
    }, [name, value]);
    // const renderError = () => {
    //     return <div className="error-message">Orders from Hawaii and Puerto Rico will not be accepted at this time.</div>;
    // };

    switch (fieldType) {
    case DynamicFormFieldType.dropdown:
        // console.log(showError && name === 'shippingAddress.stateOrProvinceCode', showError, name);
        const selectedValue =  name === 'shippingAddress.countryCode' ? 'US' : value;
        const selectedOption = options && value ? options.find(option => option.value === selectedValue) : '';

        return (
            <>
                <select
                    { ...rest as any }
                    className="form-select optimizedCheckout-form-select"
                    data-test={ `${id}-select` }
                    id={ id }
                    name={ name }
                    onChange={ onChange }
                    ref={ hiddenSelect }
                    value={ selectedValue === null ? '' : selectedValue }
                >
                    { placeholder &&
                        <option value="">
                            { placeholder }
                        </option> }
                    { options && options.map(({ label, value: optionValue }) =>
                        <option
                            key={ optionValue }
                            value={ optionValue }
                        >
                            { label }
                        </option>
                    ) }
                </select>

                <Select
                    defaultValue={ selectedOption }
                    filterOption={ filterOption }
                    isSearchable={ true }
                    onChange={ selectedOption => handleChangeOfFakeSelect(selectedOption) }
                    options={ options as any }
                    styles={ customStyles }
                    value={ selectedOption }
                />
                { /* { showError && name === 'shippingAddress.stateOrProvinceCode' ? renderError() : null } */ }
            </>
        );

    case DynamicFormFieldType.radio:
        if (!options || !options.length) {
            return null;
        }

        return <>
            { options.map(({ label, value: optionValue }) =>
                <RadioInput
                    { ...rest }
                    checked={ optionValue === value }
                    id={ `${id}-${optionValue}` }
                    key={ optionValue }
                    label={ label }
                    name={ name }
                    onChange={ onChange }
                    testId={ `${id}-${optionValue}-radio` }
                    value={ optionValue }
                />) }
        </>;

    case DynamicFormFieldType.checkbox:
        if (!options || !options.length) {
            return null;
        }

        return <>
            { options.map(({ label, value: optionValue }) =>
                <CheckboxInput
                    { ...rest }
                    checked={ Array.isArray(value) ? value.includes(optionValue) : false }
                    id={ `${id}-${optionValue}` }
                    key={ optionValue }
                    label={ label }
                    name={ name }
                    onChange={ onChange }
                    testId={ `${id}-${optionValue}-checkbox` }
                    value={ optionValue }
                />) }
        </>;

    case DynamicFormFieldType.date:
        return (
            <ReactDatePicker
                { ...rest as any }
                autoComplete="off"
                // FIXME: we can avoid this by simply using onChangeRaw, but it's not being triggered properly
                // https://github.com/Hacker0x01/react-datepicker/issues/1357
                // onChangeRaw={ rest.onChange }
                calendarClassName="optimizedCheckout-contentPrimary"
                className="form-input optimizedCheckout-form-input"
                dateFormat={ inputFormat }
                maxDate={ rest.max ? new Date(`${rest.max}T00:00:00Z`) : undefined }
                minDate={ rest.min ? new Date(`${rest.min}T00:00:00Z`) : undefined }
                name={ name }
                onChange={ handleDateChange }
                placeholderText={ inputFormat.toUpperCase() }
                popperClassName="optimizedCheckout-contentPrimary"
                selected={ isDate(value) ? value : undefined }
            />
        );

    case DynamicFormFieldType.multiline:
        return (
            <TextArea
                { ...rest as any }
                id={ id }
                name={ name }
                onChange={ onChange }
                testId={ `${id}-text` }
                type={ fieldType }
                value={ value }
            />
        );

    default:
        return (
            <TextInput
                { ...rest }
                additionalClassName={ additionalClassName }
                id={ id }
                name={ name }
                onBlur={ onBlur }
                onChange={ onChange }
                placeholder={ placeholder }
                testId={ `${id}-${ fieldType === DynamicFormFieldType.password ?
                    'password' :
                    'text' }` }
                type={ fieldType }
                value={ value }
            />
        );
    }
};

export default memo(withDate(DynamicInput));
