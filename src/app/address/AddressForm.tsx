import { Address, Country, FormField } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { forIn, noop } from 'lodash';
import React, { createRef, Component, ReactNode, RefObject } from 'react';

import { withLanguage, TranslatedString, WithLanguageProps } from '../locale';
import { AutocompleteItem } from '../ui/autocomplete';
import { DynamicFormField, DynamicFormFieldType, Fieldset } from '../ui/form';

import { AddressKeyMap } from './address';
import { getAddressFormFieldInputId, getAddressFormFieldLegacyName } from './getAddressFormFieldInputId';
// import { mapToAddress, GoogleAutocompleteFormField } from './googleAutocomplete';
// eslint-disable-next-line import/no-internal-modules
import Autocomplete from './smartyStreetAutoComplete/Autocomplete';
import './AddressForm.scss';

export interface AddressFormProps {
    fieldName?: string;
    countryCode?: string;
    countriesWithAutocomplete?: string[];
    countries?: Country[];
    formFields: FormField[];
    formik?: any;
    googleMapsApiKey?: string;
    shouldShowSaveAddress?: boolean;
    showErrorInState?: boolean;
    showPoBoxError?: boolean;
    showPscError?: boolean;
    isBillingAddress?: boolean;
    onBlur?: any;
    showAddressNotSelectedError?: boolean;
    onAutocompleteSelect?(address: Partial<Address>): void;
    onAutocompleteToggle?(state: { inputValue: string; isOpen: boolean }): void;
    onChange?(fieldName: string, value: string | string[]): void;
    setFieldValue?(fieldName: string, value: string | string[]): void;
    updateAddressSelected?(value: boolean): void;
}

const LABEL: AddressKeyMap = {
    address1: 'address.address_line_1_label',
    address2: 'address.address_line_2_label',
    city: 'address.city_label',
    company: 'address.company_name_label',
    countryCode: 'address.country_label',
    firstName: 'address.first_name_label',
    lastName: 'address.last_name_label',
    phone: 'address.phone_number_label',
    postalCode: 'address.postal_code_label',
    stateOrProvince: 'address.state_label',
    stateOrProvinceCode: 'address.state_label',
};

const AUTOCOMPLETE: AddressKeyMap = {
    address1: 'address-line1',
    address2: 'address-line2',
    city: 'address-level2',
    company: 'organization',
    countryCode: 'country',
    firstName: 'given-name',
    lastName: 'family-name',
    phone: 'tel',
    postalCode: 'postal-code',
    stateOrProvince: 'address-level1',
    stateOrProvinceCode: 'address-level1',
};

const PLACEHOLDER: AddressKeyMap = {
    countryCode: 'address.country_label',
    stateOrProvince: 'address.state_label',
    stateOrProvinceCode: 'address.state_label',
    // firstName: 'address.first_name_label',
    // lastName: 'address.last_name_label',
    // address1: 'address.address_line_1_label',
    // address2: 'address.address_line_2_label',
    // city: 'address.city_label',
    // postalCode: 'address.postal_code_label',
};

const AUTOCOMPLETE_FIELD_NAME = 'address1';

class AddressForm extends Component<AddressFormProps & WithLanguageProps> {
    private containerRef: RefObject<HTMLElement> = createRef();
    private nextElement?: HTMLElement | null;

    private handleDynamicFormFieldChange: (name: string) => (value: string | string[]) => void = memoize(name => value => {
        this.syncNonFormikValue(name, value);
    });

    componentDidMount(): void {
        const { current } = this.containerRef;

        if (current) {
            this.nextElement = current.querySelector<HTMLElement>('[autocomplete="address-line2"]');
        }

    }

    render(): ReactNode {
        const {
            formFields,
            fieldName,
            // countriesWithAutocomplete,
            countryCode,
            // googleMapsApiKey,
            onAutocompleteToggle,
            setFieldValue,
            formik,
            // shouldShowSaveAddress,
            showErrorInState,
            isBillingAddress,
            showPoBoxError,
            showAddressNotSelectedError,
            showPscError,
            onBlur,
            updateAddressSelected,
        } = this.props;

        const FORMFIELD = [
            { name: 'firstName', label: 'First Name'},
            { name: 'lastName', label: 'Last Name'},
            { name: 'address1', label: 'Address Line 1'},
            { name: 'address2', label: 'Address Line 2 (Optional)'},
            { name: 'countryCode', label: 'Country'},
            { name: 'city', label: 'City'},
            { name: 'stateOrProvinceCode', label: 'State'},
            { name: 'stateOrProvince', label: 'State'},
            { name: 'postalCode', label: 'Zip Code'},
        ];

        const fields = FORMFIELD.map(item => {
            const match = formFields.find(i => i.name === item.name);
            if (match) {
                return match;
            }
        }).filter(item => item) as FormField[];

        return (<>
            <Fieldset>
                { /* {console.log(formik)} */ }
                <div className="checkout-address" ref={ this.containerRef as RefObject<HTMLDivElement> }>
                    { fields.map(field => {
                        const addressFieldName = field.name;
                        const translatedPlaceholderId = PLACEHOLDER[addressFieldName];

                        if (addressFieldName === 'address1' && !isBillingAddress) {
                            return (
                                <Autocomplete
                                    countryCode={ countryCode }
                                    field={ field }
                                    formik={ formik }
                                    key={ field.id }
                                    label={ field.custom ? field.label : <TranslatedString id={ LABEL[field.name] } /> }
                                    nextElement={ this.nextElement || undefined }
                                    onBlur={ onBlur }
                                    onChange={ this.handleAutocompleteChange }
                                    onSelect={ this.handleAutocompleteSelect }
                                    onToggleOpen={ onAutocompleteToggle }
                                    parentFieldName={ fieldName }
                                    placeholder={ this.getPlaceholderValue(field, translatedPlaceholderId) }
                                    showAddressNotSelectedError = { showAddressNotSelectedError }
                                    showPoBoxError={ showPoBoxError }
                                    showPscError= { showPscError }
                                    updateAddressSelected = { updateAddressSelected }
                                    // supportedCountries={ countriesWithAutocomplete }
                                />
                                // <GoogleAutocompleteFormField
                                //     apiKey={ googleMapsApiKey }
                                //     countryCode={ countryCode }
                                //     field={ field }
                                //     key={ field.id }
                                //     nextElement={ this.nextElement || undefined }
                                //     onChange={ this.handleAutocompleteChange }
                                //     onSelect={ this.handleAutocompleteSelect }
                                //     onToggleOpen={ onAutocompleteToggle }
                                //     parentFieldName={ fieldName }
                                //     placeholder={ this.getPlaceholderValue(field, translatedPlaceholderId) }
                                //     supportedCountries={ countriesWithAutocomplete }
                                // />
                            );
                        }

                        return (
                            <DynamicFormField
                                autocomplete={ AUTOCOMPLETE[field.name] }
                                extraClass={ `dynamic-form-field--${getAddressFormFieldLegacyName(addressFieldName)}` }
                                field={ field }
                                inputId={ getAddressFormFieldInputId(addressFieldName) }
                                // stateOrProvince can sometimes be a dropdown or input, so relying on id is not sufficient
                                key={ `${field.id}-${field.name}` }
                                label={ field.custom ? field.label : <TranslatedString id={ LABEL[field.name] } /> }
                                onBlur={ onBlur }
                                onChange={ this.handleDynamicFormFieldChange(addressFieldName) }
                                parentFieldName={ field.custom ?
                                    (fieldName ? `${fieldName}.customFields` : 'customFields') :
                                    fieldName }
                                placeholder={ this.getPlaceholderValue(field, translatedPlaceholderId) }
                                setFieldValue={ setFieldValue }
                                showErrorInState={ showErrorInState }
                            />
                        );
                    }) }
                </div>
            </Fieldset>
            { /* { shouldShowSaveAddress &&
                <CheckboxFormField
                    labelContent={ <TranslatedString id="address.save_in_addressbook" /> }
                    name={ fieldName ? `${fieldName}.shouldSaveAddress` : 'shouldSaveAddress' }
                /> } */ }
        </>);
    }

    private getPlaceholderValue(field: FormField, translatedPlaceholderId: string): string {
        const { language } = this.props;

        if (field.default && field.fieldType !== 'dropdown') {
            return field.default;
        } else {
            return translatedPlaceholderId && language.translate(translatedPlaceholderId);
        }
    }

    private handleAutocompleteChange: (value: string, isOpen: boolean) => void = (value, isOpen) => {
        if (!isOpen) {
            this.syncNonFormikValue(AUTOCOMPLETE_FIELD_NAME, value);
        }
    };

    private handleAutocompleteSelect: (
        address: Partial<Address>,
        item: AutocompleteItem
    ) => void = (address, { value: autocompleteValue }) => {
        const {
            // countries,
            setFieldValue = noop,
            onChange = noop,
            onBlur,
        } = this.props;

        // const address = mapToAddress(place, countries);

        forIn(address, (value, fieldName) => {
            setFieldValue(fieldName, value as string);
            onChange(fieldName, value as string);
        });
        // console.log(address, autocompleteValue);

        if (autocompleteValue) {
            this.syncNonFormikValue(AUTOCOMPLETE_FIELD_NAME, autocompleteValue);
        }
        if (onBlur) {
            setTimeout(() => onBlur(), 1000);
            // onBlur();
        }
    };

    // because autocomplete state is controlled by Downshift, we need to manually keep formik
    // value in sync when autocomplete value changes
    private syncNonFormikValue: (
        fieldName: string,
        value: string | string[]
    ) => void = (fieldName, value) => {
        const {
            formFields,
            setFieldValue = noop,
            onChange = noop,
        } = this.props;

        const dateFormFieldNames = formFields
            .filter(field => field.custom && field.fieldType === DynamicFormFieldType.date)
            .map(field => field.name);

        if (fieldName === AUTOCOMPLETE_FIELD_NAME || dateFormFieldNames.indexOf(fieldName) > -1) {
            setFieldValue(fieldName, value);
        }

        onChange(fieldName, value);
    };
}

export default withLanguage(AddressForm);
