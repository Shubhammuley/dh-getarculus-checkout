/* eslint-disable @typescript-eslint/tslint/config */
/* eslint-disable react/jsx-no-bind */
import { Address, FormField as FormFieldType } from '@bigcommerce/checkout-sdk';
import React, { ReactNode } from 'react';
import * as SmartySDK from 'smartystreets-javascript-sdk';

// import * as sdkUtils from 'smartystreets-javascript-sdk-utils';
import { withCheckout, CheckoutContextProps } from '../../checkout';
import { AutocompleteItem } from '../../ui/autocomplete';

import Suggestions from './Suggestions';

// eslint-disable-next-line @typescript-eslint/tslint/config
const sdkUtils = require('smartystreets-javascript-sdk-utils');

// import InputForm from './InputForm';

export interface WithCheckoutProps {
    shippingAddress?: Address;
}

export interface GoogleAutocompleteFormFieldProps {
    field: FormFieldType;
    countryCode?: string;
    // supportedCountries: string[];
    nextElement?: HTMLElement;
    parentFieldName?: string;
    label?: ReactNode;
    formik?: any;
    placeholder?: string;
    shippingAddress?: Address;
    showPoBoxError?: boolean;
    showPscError?: boolean;
    showAddressNotSelectedError?: boolean;
    onBlur?:any;
    onSelect(address: Partial<Address>, item: AutocompleteItem): void;
    onToggleOpen?(state: { inputValue: string; isOpen: boolean }): void;
    onChange(value: string, isOpen: boolean): void;
    updateAddressSelected?(value: boolean): void;
}

export interface GoogleAutocompleteFormFieldState {
    shouldValidate: boolean;
    address1: string;
    address2: string;
    state: string;
    city: string;
    zipCode: string;
    suggestions: any;
    showError: boolean;
    pscShowError: boolean;
    showSuggestion: boolean;
}

export interface Samrtycomponent {
    SmartyCore?: any;
    autoCompleteClient?: any;
    usStreetClient?: any;
}
class Autocomplete extends React.Component<GoogleAutocompleteFormFieldProps, GoogleAutocompleteFormFieldState, Samrtycomponent> {
    // private SmartyCore?: any | null;
    private autoCompleteClient?: any | null;
    private usStreetClient?: any | null;

    constructor(props: GoogleAutocompleteFormFieldProps) {
        super(props);

        const { shippingAddress, showPoBoxError, showPscError } = props;
        this.state = {
            shouldValidate: true,
            address1: shippingAddress?.address1 || '',
            address2: '',
            city: '',
            state: '',
            zipCode: '',
            showError: showPoBoxError || false,
            suggestions: {result: []},
            showSuggestion: false,
            pscShowError: showPscError || false,
        };

        const SmartyCore = SmartySDK.core;
        // const websiteKey = '122541045875848757'; // Your website key here
        const websiteKey = '112226358730991936'; // Your website key here
        const smartySharedCredentials = new SmartyCore.SharedCredentials(websiteKey);
        const autoCompleteClientBuilder = new SmartyCore.ClientBuilder(smartySharedCredentials).withLicenses(['us-autocomplete-pro-cloud']);
        const usStreetClientBuilder = new SmartyCore.ClientBuilder(smartySharedCredentials);

        // this.SmartyCore = SmartyCore;
        this.autoCompleteClient = autoCompleteClientBuilder.buildUsAutocompleteProClient();
        this.usStreetClient = usStreetClientBuilder.buildUsStreetApiClient();

        this.updateField = this.updateField.bind(this);
        this.updateCheckbox = this.updateCheckbox.bind(this);
        this.queryAutocompleteForSuggestions = this.queryAutocompleteForSuggestions.bind(this);
        this.selectSuggestion = this.selectSuggestion.bind(this);
        this.updateStateFromValidatedUsAddress = this.updateStateFromValidatedUsAddress.bind(this);
        this.validateUsAddress = this.validateUsAddress.bind(this);
        this.formatAutocompleteSuggestion = this.formatAutocompleteSuggestion.bind(this);
    }
    componentDidMount(): void {
        const {
            field,
        } = this.props;
        const input = document.getElementById(field.name) as HTMLInputElement;
        if (input?.value) {
            const targetElement = input.closest('.form-field');
            // console.log(targetElement);
            if (targetElement) {
                const value = input?.value;
                (value && value !== '')
                    ? targetElement.classList.add('floating-label')
                    : targetElement.classList.remove('floating-label');
            }
            // document.body.onclick = (e: any) => {
            //       console.log(e);
            //       if (e.target.id !== 'autocomplete--suggestion') {
            //           this.setState({ showSuggestion: false });
            //       }
            //     };
            // const formDiv = document.getElementById('email-form');
            // if (formDiv) {
            //     formDiv.classList.add('floating-label');
            // }
        }
    }

    // componentDidUpdate(): void {
    //     // const
    // }

    // getDerivedStateFromProps(props: GoogleAutocompleteFormFieldProps) {
    //     const { showPoBoxError } = props;
    //     console.log("-----", showPoBoxError)

    //     return { showError: showPoBoxError };
    // }

    updateStateFromForm(key: string, value: any) {
        const newState = {
            [key]: value,
        } as any;
        this.setState(newState);
    }

    updateField(e: any) {
        this.updateStateFromForm(e.target.id, e.target.value);
    }

    updateCheckbox(e: any) {
        this.updateStateFromForm(e.target.id, e.target.checked);
    }

    formatAutocompleteSuggestion(suggestion: any) {
        const street = suggestion.streetLine ? `${suggestion.streetLine} ` : '';
        const secondary = suggestion?.secondary ? `${suggestion.secondary} ` : '';
        const entries = suggestion?.entries !== 0 ? `(${suggestion.entries}) ` : '';
        const city = suggestion?.city ? `${suggestion.city} ` : '';
        const state = suggestion?.state ? `${suggestion.state}, ` : '';
        const zip = suggestion?.zipcode ? `${suggestion.zipcode}` : '';

        return street + secondary + entries + city + state + zip;
    }

    async queryAutocompleteForSuggestions(query: any, hasSecondaries= false) {
        const lookup = new SmartySDK.usAutocompletePro.Lookup(query);
        const { showError, pscShowError } = this.state;
        if (showError) {
            this.setState({
                showError: false,
                pscShowError: false,
            });
        }
        if (pscShowError) {
            this.setState({
                showError: false,
                pscShowError: false,
            });
        }

        const {
            onChange,
        } = this.props;

        await onChange(query, false);
        if (hasSecondaries) {
            lookup.selected = query;
        }
        lookup.excludeStates = ['AA', 'AE', 'AP', 'AS', 'FM', 'GU', 'MH', 'MP', 'PW'];
        // console.log(lookup);
        this.autoCompleteClient.send(lookup)
            .then((results: any) => {
                // console.log('-----');
                this.setState({suggestions: results, showSuggestion: true });
            })
            .catch((e: any) => console.log(e));
    }

    selectSuggestion(suggestion: any) {
        if (suggestion.entries > 1) {
            this.queryAutocompleteForSuggestions(this.formatAutocompleteSuggestion(suggestion), true);
        } else {
            this.useAutoCompleteSuggestion(suggestion)
                .then(() => {
                    const { shouldValidate } = this.state;
                    if (shouldValidate) { this.validateUsAddress(); }
                });
        }
        // const { onBlur } = this.props;
        // if(onBlur) {
        //     console.log("onblur on seleclr")
        //     onBlur();
        // };
    }

    useAutoCompleteSuggestion(suggestion: any) {
        return new Promise(resolve => {
            const { onSelect, updateAddressSelected } = this.props;
            const isPoBoxAddress = suggestion.streetLine.toLowerCase().indexOf('po box');
            const isPscAddress = suggestion.streetLine.toLowerCase().indexOf('psc');

            if (isPoBoxAddress> -1) {
                this.setState({
                    showError: true,
                    address1: '',
                    address2: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    suggestions: {result: []},
                    showSuggestion: false,
                });

                return;
            }

            if (isPscAddress> -1) {
                this.setState({
                    pscShowError: true,
                    address1: '',
                    address2: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    suggestions: {result: []},
                    showSuggestion: false,
                });

                return;
            }

            const address = {
                address1: suggestion.streetLine,
                address2: suggestion.secondary,
                city: suggestion.city,
                stateOrProvinceCode: suggestion.state,
                zipCode: suggestion.zipcode,
                postalCode: suggestion.zipcode,
            };
            const item = { value: suggestion.streetLine } as AutocompleteItem;
            onSelect(address, item);
            if (updateAddressSelected) {
                updateAddressSelected(true);
            }
            this.setState({
                address1: suggestion.streetLine,
                address2: suggestion.secondary,
                city: suggestion.city,
                state: suggestion.state,
                zipCode: suggestion.zipcode,
                suggestions: {result: []},
                showSuggestion: false,
            }, resolve as any);
        });
    }

    validateUsAddress() {
        const {
          address1,
          address2,
          city,
          state,
          zipCode,
        } = this.state;
        const lookup = new SmartySDK.usStreet.Lookup();
        lookup.street = address1;
        lookup.street2 = address2;
        lookup.city = city;
        lookup.state = state;
        lookup.zipCode = zipCode;

        if (!!lookup.street) {
            this.usStreetClient.send(lookup)
                .then((response: any) => this.updateStateFromValidatedUsAddress(response, true))
                .catch((e: any) => console.log(e));
        } else {
            console.log('A street address is required.');
        }
    }

    updateStateFromValidatedUsAddress(response: any, isAutocomplete = false) {
        const lookup = response.lookups[0];
        const isValid = sdkUtils.isValid(lookup);
        const isAmbiguous = sdkUtils.isAmbiguous(lookup);
        const isMissingSecondary = sdkUtils.isMissingSecondary(lookup);
        const newState = {
            error: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            zipCode: '',
        };


        if (!isValid) {
            // newState.error = 'The address is invalid.';
        } else if (isAmbiguous) {
            // newState.error = 'The address is ambiguous.';
        } else if (isMissingSecondary && !isAutocomplete) {
            // newState.error = 'The address is missing a secondary number.';
        } else if (isValid) {
            const candidate = lookup.result[0];

            newState.address1 = candidate.deliveryLine1 as string;
            newState.address2 = candidate.deliveryLine2 || '';
            newState.city = candidate.components.cityName as string;
            newState.state = candidate.components.state as string;
            newState.zipCode = `${candidate.components.zipCode}-${candidate.components.plus4Code}`;
            // newState.error = '';
        }

        this.setState(newState as any);
    }
    labelOnFocus(event: any) {
        event.target.closest('.form-field').classList.add('floating-label');
    }

    labelOnBlur = (event: any) => {
        const { onBlur } = this.props;

        if(onBlur) {
            onBlur();
        }
        const targetElement = event.target.closest('.form-field');
        const { showSuggestion } = this.state;

        if (event.target.value && event.target.value.toLowerCase().includes('po box')) {
            this.setState({ showError: true });
        }

        if (event.target.value && event.target.value.toLowerCase().includes('psc')) {
            this.setState({ pscShowError: true });
        }
        setTimeout(() => {
          if (showSuggestion) {
              this.setState({ showSuggestion: false });
          }
        }, 500);

        if (targetElement) {
            const value = event.target.value;
            (value && value !== '')
                ? targetElement.classList.add('floating-label')
                : targetElement.classList.remove('floating-label');
        }
    };

    render() {
        const {
            suggestions,
            address1,
            showError,
            showSuggestion,
            pscShowError,
        } = this.state;

        const {
            field,
            label,
            updateAddressSelected,
            // showAddressNotSelectedError,
            // showPoBoxError,
        } = this.props;
        // const { values: { shippingAddress } } = formik;

        return(
            <div className={ 'dynamic-form-field dynamic-form-field--addressLine1' }>
            <div className={ 'form-field' }>
                        <label
                            className={ 'form-label optimizedCheckout-form-label' }
                        >
                            { label }
                        </label>
                        <input
                            autoComplete= "off"
                            className={ 'form-input optimizedCheckout-form-input filled' }
                            id={ field.name }
                            onBlur={ event => this.labelOnBlur(event) }
                            onChange={ e => {
                                if (updateAddressSelected) {
                                    updateAddressSelected(false);
                                }
                                this.updateField(e);
                                if(e.target.value) {
                                    this.queryAutocompleteForSuggestions(e.target.value);
                                }
                            } }
                            onFocus={ event => this.labelOnFocus(event) }
                            type="text"
                            value={ address1 }
                        />
                    </div>
                    {
                        showError ? (<div className="pobox-error-message">
                        Arculus does not currently ship outside of the United States or to PO Box Addresses, please update your address accordingly to checkout.
                        </div>) : null
                    }
                    {
                        pscShowError ? (<div className="pobox-error-message">
                        Unfortunately, this address cannot be validated. Please use another address.
                        </div>) : null
                    }
                    {
                        showSuggestion && suggestions && suggestions.result && suggestions.result.length ? (
                            <Suggestions
                                selectSuggestion={ this.selectSuggestion }
                                suggestions={ suggestions }
                            />
                        ) : null
                    }
                    { /* {
                        showAddressNotSelectedError && <div className="pobox-error-message">
                            Please select from the suggested address.
                        </div>
                    } */ }

            </div>);
    }
}

function mapToBillingProps({
    checkoutState,
}: CheckoutContextProps): WithCheckoutProps | null {
    const {
        data: {
            getShippingAddress,
        },
    } = checkoutState;

    return {
        shippingAddress: getShippingAddress(),
    };
}

export default withCheckout(mapToBillingProps)(Autocomplete);
