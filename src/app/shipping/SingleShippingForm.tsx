/* eslint-disable @typescript-eslint/tslint/config */
/* eslint-disable react/jsx-no-bind */
import { Address, CheckoutParams, CheckoutSelectors, Consignment, Country, CustomerAddress, CustomerRequestOptions, FormField, RequestOptions, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import { debounce, noop } from 'lodash';
import React, { PureComponent, ReactNode } from 'react';
import * as SmartySDK from 'smartystreets-javascript-sdk';
import { lazy, object } from 'yup';

import { getAddressFormFieldsValidationSchema, getTranslateAddressError, isEqualAddress, mapAddressFromFormValues, mapAddressToFormValues, AddressFormValues } from '../address';
import { getCustomFormFieldsValidationSchema } from '../formFields';
import { withLanguage, WithLanguageProps } from '../locale';
import { Fieldset, Form, FormContext } from '../ui/form';

import ShippingAddress from './ShippingAddress';
import { SHIPPING_ADDRESS_FIELDS } from './ShippingAddressFields';
import ShippingFormFooter from './ShippingFormFooter';

// const sdkUtils = require('smartystreets-javascript-sdk-utils');

// import hasSelectedShippingOptions from './hasSelectedShippingOptions';
// import BillingSameAsShippingField from './BillingSameAsShippingField';

export interface SingleShippingFormProps {
    addresses: CustomerAddress[];
    isBillingSameAsShipping: boolean;
    cartHasChanged: boolean;
    consignments: Consignment[];
    countries: Country[];
    countriesWithAutocomplete: string[];
    customerMessage: string;
    googleMapsApiKey?: string;
    isLoading: boolean;
    isShippingStepPending: boolean;
    isMultiShippingMode: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowSaveAddress?: boolean;
    shouldShowOrderComments: boolean;
    showErrorInState: boolean;
    showPoBoxError?: boolean;
    buttonLoading?: boolean;
    showPscError?: boolean;
    suggestedAddress?: any;
    onBlur?: any;
    onChangeRadio?: any;
    selectedAddress?:any;
    originalAddress?: any,
    showAddressNotSelectedError?: boolean;
    deinitialize(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initialize(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    onSubmit(values: SingleShippingFormValues): void;
    onUnhandledError?(error: Error): void;
    signOut(options?: CustomerRequestOptions): void;
    updateAddressSelected(value: boolean): void;
    updateAddress(address: Partial<Address>, options?: RequestOptions<CheckoutParams>): Promise<CheckoutSelectors>;
}

export interface SingleShippingFormValues {
    billingSameAsShipping: boolean;
    shippingAddress?: AddressFormValues;
    orderComment: string;
}

interface SingleShippingFormState {
    isResettingAddress: boolean;
    isUpdatingShippingData: boolean;
    hasRequestedShippingOptions: boolean;
}

export const SHIPPING_AUTOSAVE_DELAY = 1700;

class SingleShippingForm extends PureComponent<SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>> {
    static contextType = FormContext;

    state: SingleShippingFormState = {
        isResettingAddress: false,
        isUpdatingShippingData: false,
        hasRequestedShippingOptions: false,
    };

    private debouncedUpdateAddress: any;
    private usStreetClient?: any | null;

    constructor(props: SingleShippingFormProps & WithLanguageProps & FormikProps<SingleShippingFormValues>) {
        super(props);

        const { updateAddress } = this.props;
        

        this.debouncedUpdateAddress = debounce(async (address: Address, includeShippingOptions: boolean) => {
            try {
                await updateAddress(address, {
                    params: {
                        include: {
                            'consignments.availableShippingOptions': includeShippingOptions,
                        },
                    },
                });
                if (includeShippingOptions) {
                    this.setState({ hasRequestedShippingOptions: true });
                }
            } finally {
                this.setState({ isUpdatingShippingData: false });
            }
        }, SHIPPING_AUTOSAVE_DELAY);
        const SmartyCore = SmartySDK.core;
        // const websiteKey = '122541045875848757'; // Your website key here
        const websiteKey = '112226358730991936'; // Your website key here
        const smartySharedCredentials = new SmartyCore.SharedCredentials(websiteKey);
        // const autoCompleteClientBuilder = new SmartyCore.ClientBuilder(smartySharedCredentials).withLicenses(['us-autocomplete-pro-cloud']);
        // const usStreetClientBuilder = new SmartyCore.ClientBuilder(smartySharedCredentials).withLicenses(['us-rooftop-geocoding-cloud']);
        const usStreetClientBuilder = new SmartyCore.ClientBuilder(smartySharedCredentials);
        // this.SmartyCore = SmartyCore;
        // this.autoCompleteClient = autoCompleteClientBuilder.buildUsAutocompleteProClient();
        this.usStreetClient = usStreetClientBuilder.buildUsStreetApiClient();
    }

    render(): ReactNode {
        const {
            addresses,
            cartHasChanged,
            isLoading,
            onUnhandledError,
            methodId,
            shouldShowSaveAddress,
            countries,
            countriesWithAutocomplete,
            googleMapsApiKey,
            shippingAddress,
            consignments,
            shouldShowOrderComments,
            initialize,
            isValid,
            deinitialize,
            values: { shippingAddress: addressForm },
            isShippingStepPending,
            showErrorInState,
            showPoBoxError,
            buttonLoading,
            updateAddressSelected,
            showPscError,
            showAddressNotSelectedError,
            suggestedAddress,
            selectedAddress,
            onChangeRadio,
            originalAddress,
        } = this.props;

        const {
            isResettingAddress,
            isUpdatingShippingData,
            hasRequestedShippingOptions,
        } = this.state;

        // const PAYMENT_METHOD_VALID = ['amazon', 'amazonpay'];
        // const shouldShowBillingSameAsShipping = !PAYMENT_METHOD_VALID.some(method => method === methodId);
        // console.log('billingSameAsShipping', showAddressNotSelectedError);

        return (
            <Form autoComplete="on" initialValues={ { countryCode: 'US'} }>
                <Fieldset>
                    <ShippingAddress
                        addresses={ addresses }
                        consignments={ consignments }
                        countries={ countries }
                        countriesWithAutocomplete={ countriesWithAutocomplete }
                        deinitialize={ deinitialize }
                        formFields={ this.getFields(addressForm && addressForm.countryCode) }
                        googleMapsApiKey={ googleMapsApiKey }
                        hasRequestedShippingOptions={ hasRequestedShippingOptions }
                        initialize={ initialize }
                        isLoading={ isResettingAddress }
                        isShippingStepPending={ isShippingStepPending }
                        methodId={ methodId }
                        onAddressSelect={ this.handleAddressSelect }
                        onBlur={ this.getSuggestedAddress }
                        onFieldChange={ this.handleFieldChange }
                        onUnhandledError={ onUnhandledError }
                        onUseNewAddress={ this.onUseNewAddress }
                        shippingAddress={ shippingAddress }
                        shouldShowSaveAddress={ shouldShowSaveAddress }
                        showAddressNotSelectedError = { showAddressNotSelectedError }
                        showErrorInState={ showErrorInState }
                        showPoBoxError={ showPoBoxError }
                        showPscError= { showPscError }
                        updateAddressSelected = { updateAddressSelected }
                    />
                    { /* {
                        shouldShowBillingSameAsShipping && <div className="form-body">
                            <BillingSameAsShippingField />
                        </div>
                    } */ }
                    { /* {
                        showAddressNotSelectedError && <div>
                            The shipping address you entered does not match the suggested provided by the united states postal service.
                        </div>
                    } */ }
                    {
                        suggestedAddress &&
                        <div className="address-section">
                            <p>The shipping address you entered does not match the suggested address provided by the United States Postal Service. Please certify your address.</p>
                              <div className={ `orig-add ${selectedAddress === 'orignalAddress' ? "add-active": ''}` }>
                                <label htmlFor="orignalAddress">
                                <input checked={ selectedAddress === 'orignalAddress' } id="orignalAddress" name="sugestedAddress" onChange={ (event: any) => onChangeRadio(event.target.value) } type="radio" value="orignalAddress" />
                                <span className="checkmark" />
                                <span>
                                   Original Address
                                </span>
                                <span>
                                    { originalAddress?.address1 }
                                </span>
                                <span>
                                    { originalAddress?.address2 }
                                </span>
                                <span>
                                    { `${originalAddress?.city }, ${ originalAddress?.stateOrProvinceCode } ${originalAddress?.postalCode}` }
                                </span>
                                </label>
                              </div>
                              <div className={ `sugg-add ${selectedAddress === 'sugestedAddress' ? "add-active": ''}` }>
                                <label htmlFor="sugestedAddress">
                                <input checked={ selectedAddress === 'sugestedAddress' } id="sugestedAddress" name="sugestedAddress" onChange={ (event: any) => onChangeRadio(event.target.value) } type="radio" value="sugestedAddress" />
                                <span className="checkmark" />
                                <span>
                                    Suggested Address
                                </span>
                                <span>
                                    { suggestedAddress?.address1 }
                                </span>
                                <span>
                                    { suggestedAddress?.address2 }
                                </span>
                                <span>
                                    { `${suggestedAddress?.city }, ${ suggestedAddress?.stateOrProvinceCode } ${suggestedAddress?.postalCode}` }
                                </span>
                                </label>
                              </div>
                        </div>
                    }
                </Fieldset>

                <ShippingFormFooter
                    cartHasChanged={ cartHasChanged }
                    isLoading={ isLoading || isUpdatingShippingData || buttonLoading as boolean }
                    isMultiShippingMode={ false }
                    shouldDisableSubmit={ this.shouldDisableSubmit() }
                    shouldShowOrderComments={ shouldShowOrderComments }
                    shouldShowShippingOptions={ isValid }
                />
            </Form>
        );
    }

    private getSuggestedAddress: () =>void = () => {
        const {
            values: { shippingAddress: addressForm },
            onBlur,
        } = this.props;
        if(addressForm?.address1 && addressForm.city && addressForm.stateOrProvinceCode && addressForm.postalCode) {
            const updatedShippingAddress = addressForm && mapAddressFromFormValues(addressForm);
            const lookup = new SmartySDK.usStreet.Lookup();
            lookup.street = updatedShippingAddress?.address1 || '';
            lookup.street2 = updatedShippingAddress?.address2 || '';
            lookup.city = updatedShippingAddress?.city || '';
            lookup.state = updatedShippingAddress?.stateOrProvince || '';
            lookup.zipCode = updatedShippingAddress?.postalCode || '';
            lookup.match = 'enhanced';
            lookup.maxCandidates = 3;

            if (!!lookup.street) {
                    this.usStreetClient.send(lookup)
                        .then((response: any) => {
                            const address = response.lookups[0];
                            // const isValid = sdkUtils.isValid(address);
                            // if (!isValid) {
                            //     return onBlur();
                            //     // newState.error = 'The address is invalid.';
                            // }
                            const candidate = address.result[0];
                            const suggestedAddress1 = {
                                ...updatedShippingAddress,
                                address1: candidate.deliveryLine1 as string,
                                address2: candidate.deliveryLine2 || '',
                                city: candidate.components.cityName as string,
                                stateOrProvince: candidate.components.state as string,
                                zipCode: candidate.components.plus4Code ? `${candidate.components.zipCode}-${candidate.components.plus4Code}` : candidate.components.zipCode,
                                postalCode: candidate.components.plus4Code ? `${candidate.components.zipCode}-${candidate.components.plus4Code}` : candidate.components.zipCode,
                            };
                            if (onBlur) {
                                onBlur(suggestedAddress1, addressForm);
                            }
                        })
                        .catch(() => onBlur(null));
                } else {
                    () => onBlur(null)
                }
        } else {
            onBlur(null);
        }

    };
    private shouldDisableSubmit: () => boolean = () => {
        const {
            isLoading,
            // consignments,
            isValid,
        } = this.props;

        const {
            isUpdatingShippingData,
        } = this.state;

        if (!isValid) {
            return false;
        }

        // console.log("---------------", isLoading, isUpdatingShippingData, !hasSelectedShippingOptions(consignments));
        return isLoading || isUpdatingShippingData ;
    };

    private handleFieldChange: (name: string) => void = async name => {
        const {
            setFieldValue,
        } = this.props;

        if (name === 'countryCode') {
            setFieldValue('shippingAddress.stateOrProvince', '');
            setFieldValue('shippingAddress.stateOrProvinceCode', '');
        }

        // Enqueue the following code to run after Formik has run validation
        await new Promise(resolve => setTimeout(resolve));

        const isShippingField = SHIPPING_ADDRESS_FIELDS.includes(name);

        const { hasRequestedShippingOptions } = this.state;

        const { isValid } = this.props;

        if (!isValid) {
            return;
        }

        this.updateAddressWithFormData(isShippingField || !hasRequestedShippingOptions);
    };

    private updateAddressWithFormData(includeShippingOptions: boolean) {
        const {
            shippingAddress,
            values: { shippingAddress: addressForm },
        } = this.props;

        const updatedShippingAddress = addressForm && mapAddressFromFormValues(addressForm);

        if (!updatedShippingAddress || isEqualAddress(updatedShippingAddress, shippingAddress)) {
            return;
        }

        this.setState({ isUpdatingShippingData: true });
        this.debouncedUpdateAddress(updatedShippingAddress, includeShippingOptions);
    }

    private handleAddressSelect: (
        address: Address
    ) => void = async address => {
        const {
            updateAddress,
            onUnhandledError = noop,
            values,
            setValues,
        } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            await updateAddress(address);

            setValues({
                ...values,
                shippingAddress: mapAddressToFormValues(
                    this.getFields(address.countryCode),
                    address
                ),
            });
        } catch (error) {
            onUnhandledError(error);
        } finally {
            this.setState({ isResettingAddress: false });
        }
    };

    private onUseNewAddress: () => void = async () => {
        const {
            deleteConsignments,
            onUnhandledError = noop,
            setValues,
            values,
        } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            const address = await deleteConsignments();
            setValues({
                ...values,
                shippingAddress: mapAddressToFormValues(
                    this.getFields(address && address.countryCode),
                    address
                ),
            });
        } catch (e) {
            onUnhandledError(e);
        } finally {
            this.setState({ isResettingAddress: false });
        }
    };

    private getFields(countryCode: string | undefined): FormField[] {
        const {
            getFields,
        } = this.props;

        return getFields(countryCode);
    }
}

export default withLanguage(withFormik<SingleShippingFormProps & WithLanguageProps, SingleShippingFormValues>({
    handleSubmit: (values, { props: { onSubmit } }) => {
        onSubmit(values);
    },
    mapPropsToValues: ({ getFields, shippingAddress, isBillingSameAsShipping, customerMessage }) => ({
        billingSameAsShipping: isBillingSameAsShipping,
        orderComment: customerMessage,
        shippingAddress: mapAddressToFormValues(
            getFields(shippingAddress && shippingAddress.countryCode),
            shippingAddress
        ),
    }),
    isInitialValid: ({
        shippingAddress,
        getFields,
        language,
    }) => (
        !!shippingAddress && getAddressFormFieldsValidationSchema({
            language,
            formFields: getFields(shippingAddress.countryCode),
        }).isValidSync(shippingAddress)
    ),
    validationSchema: ({
        language,
        getFields,
        methodId,
    }: SingleShippingFormProps & WithLanguageProps) => methodId ?
        object({
            shippingAddress: lazy<Partial<AddressFormValues>>(formValues =>
                getCustomFormFieldsValidationSchema({
                    translate: getTranslateAddressError(language),
                    formFields: getFields(formValues && formValues.countryCode),
                })
            ),
        }) :
        object({
            shippingAddress: lazy<Partial<AddressFormValues>>(formValues =>
                getAddressFormFieldsValidationSchema({
                    language,
                    formFields: getFields(formValues && formValues.countryCode),
                })
            ),
        }),
    enableReinitialize: false,
})(SingleShippingForm));
