import { Address, Consignment, Country, CustomerAddress, FormField } from '@bigcommerce/checkout-sdk';
import React, { Component, ReactNode } from 'react';

import {  isValidCustomerAddress, AddressForm, AddressSelect } from '../address';
import { connectFormik, ConnectFormikProps } from '../common/form';
import { Fieldset } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

import { SingleShippingFormValues } from './SingleShippingForm';

export interface ShippingAddressFormProps {
    addresses: CustomerAddress[];
    address?: Address;
    consignments: Consignment[];
    countries?: Country[];
    countriesWithAutocomplete: string[];
    googleMapsApiKey?: string;
    isLoading: boolean;
    formFields: FormField[];
    shouldShowSaveAddress?: boolean;
    showErrorInState: boolean;
    showPoBoxError?: boolean;
    showPscError?: boolean;
    showAddressNotSelectedError?: boolean;
    onBlur?: any;
    onUseNewAddress(): void;
    onFieldChange(fieldName: string, value: string): void;
    onAddressSelect(address: Address): void;
    updateAddressSelected(value: boolean): void;
}

const addressFieldName = 'shippingAddress';

const FORMFIELD = [
    { name: 'firstName', label: 'First Name'},
    { name: 'lastName', label: 'Last Name'},
    { name: 'address1', label: 'Address Line 1'},
    { name: 'address2', label: 'Address Line 2 (Optional)'},
    { name: 'countryCode', label: 'Country'},
    { name: 'city', label: 'City'},
    { name: 'stateOrProvinceCode', label: 'State'},
    { name: 'postalCode', label: 'Zip Code'},
];

class ShippingAddressForm extends Component<ShippingAddressFormProps & ConnectFormikProps<SingleShippingFormValues>> {
    render(): ReactNode {
        const {
            addresses,
            address: shippingAddress,
            onAddressSelect,
            onUseNewAddress,
            shouldShowSaveAddress,
            countries,
            countriesWithAutocomplete,
            formFields,
            isLoading,
            googleMapsApiKey,
            formik,
            formik: {
                values: {
                    shippingAddress: formAddress,
                },
            },
            showErrorInState,
            showPoBoxError,
            showAddressNotSelectedError,
            showPscError,
            onBlur,
            updateAddressSelected,
        } = this.props;

        const hasAddresses = addresses && addresses.length > 0;
        const hasValidCustomerAddress = isValidCustomerAddress(shippingAddress, addresses, formFields);
        const fields = FORMFIELD.map(item => {
            const match = formFields.find(i => i.name === item.name);
            if (match) {
                return match;
            }
        }).filter(item => item) as FormField[];

        return (
            <Fieldset id="checkoutShippingAddress">
                { hasAddresses &&
                    <Fieldset id="shippingAddresses">
                        <LoadingOverlay isLoading={ isLoading }>
                            <AddressSelect
                                addresses={ addresses }
                                onSelectAddress={ onAddressSelect }
                                onUseNewAddress={ onUseNewAddress }
                                selectedAddress={ hasValidCustomerAddress ? shippingAddress : undefined }
                            />
                        </LoadingOverlay>
                    </Fieldset> }

                { !hasValidCustomerAddress &&
                    <LoadingOverlay isLoading={ isLoading } unmountContentWhenLoading>
                        <AddressForm
                            countries={ countries }
                            countriesWithAutocomplete={ countriesWithAutocomplete }
                            countryCode={ formAddress && formAddress.countryCode }
                            fieldName={ addressFieldName }
                            formFields={ fields }
                            formik = { formik }
                            googleMapsApiKey={ googleMapsApiKey }
                            onAutocompleteToggle={ this.handleAutocompleteToggle }
                            onBlur={ onBlur }
                            onChange={ this.handleChange }
                            setFieldValue={ this.setFieldValue }
                            shouldShowSaveAddress={ shouldShowSaveAddress }
                            showAddressNotSelectedError={ showAddressNotSelectedError }
                            showErrorInState={ showErrorInState }
                            showPoBoxError={ showPoBoxError }
                            showPscError= { showPscError }
                            updateAddressSelected ={ updateAddressSelected }
                        />
                    </LoadingOverlay> }
            </Fieldset>
        );
    }

    private setFieldValue: (fieldName: string, fieldValue: string) => void = (fieldName, fieldValue) => {
        const {
            formik: { setFieldValue },
            formFields,
        } = this.props;

        const customFormFieldNames = formFields
            .filter(field => field.custom)
            .map(field => field.name);

        const formFieldName = customFormFieldNames.includes(fieldName) ?
            `customFields.${fieldName}` :
            fieldName;

        setFieldValue(`${addressFieldName}.${formFieldName}`, fieldValue);
    };

    private handleChange: (fieldName: string, value: string) => void = (fieldName, value) => {
        const {
            onFieldChange,
        } = this.props;

        onFieldChange(fieldName, value);
    };

    private handleAutocompleteToggle: (state: { inputValue: string; isOpen: boolean }) => void = ({ isOpen, inputValue }) => {
        const { onFieldChange } = this.props;

        if (!isOpen) {
            onFieldChange('address1', inputValue);
        }
    };
}

export default connectFormik(ShippingAddressForm);
