/* eslint-disable @typescript-eslint/tslint/config */
import { Address, AddressRequestBody, BillingAddress, Cart, CheckoutRequestBody, CheckoutSelectors, Consignment, ConsignmentAssignmentRequestBody, Country, Customer, CustomerRequestOptions, FormField, ShippingInitializeOptions, ShippingRequestOptions } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';
import { createSelector } from 'reselect';
// import * as SmartySDK from 'smartystreets-javascript-sdk';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { EMPTY_ARRAY } from '../common/utility';
import { LoadingOverlay } from '../ui/loading';

import { UnassignItemError } from './errors';
import getShippableItemsCount from './getShippableItemsCount';
import getShippingMethodId from './getShippingMethodId';
import { MultiShippingFormValues } from './MultiShippingForm';
import ShippingForm from './ShippingForm';
import ShippingHeader from './ShippingHeader';
import { SingleShippingFormValues } from './SingleShippingForm';

// const sdkUtils = require('smartystreets-javascript-sdk-utils');

export interface ShippingProps {
    isBillingSameAsShipping: boolean;
    cartHasChanged: boolean;
    isMultiShippingMode: boolean;
    showAddressNotSelectedError: boolean;
    addressNotSelected: boolean;
    onCreateAccount(): void;
    onToggleMultiShipping(): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    onSignIn(): void;
    navigateNextStep(isBillingSameAsShipping: boolean): void;
    showPayment(): void;
    updateShowAddressError(value: boolean): void;
    updateAddressSelected(value: boolean): void;
}

export interface WithCheckoutShippingProps {
    billingAddress?: Address;
    cart: Cart;
    consignments: Consignment[];
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isGuest: boolean;
    isInitializing: boolean;
    isLoading: boolean;
    isShippingStepPending: boolean;
    methodId?: string;
    shippingAddress?: Address;
    shouldShowAddAddressInCheckout: boolean;
    shouldShowMultiShipping: boolean;
    shouldShowOrderComments: boolean;
    getBillingAddress(): BillingAddress | undefined;
    assignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    deinitializeShippingMethod(options: ShippingRequestOptions): Promise<CheckoutSelectors>;
    deleteConsignments(): Promise<Address | undefined>;
    getFields(countryCode?: string): FormField[];
    initializeShippingMethod(options: ShippingInitializeOptions): Promise<CheckoutSelectors>;
    loadShippingAddressFields(): Promise<CheckoutSelectors>;
    loadShippingOptions(): Promise<CheckoutSelectors>;
    signOut(options?: CustomerRequestOptions): void;
    createCustomerAddress(address: AddressRequestBody): Promise<CheckoutSelectors>;
    unassignItem(consignment: ConsignmentAssignmentRequestBody): Promise<CheckoutSelectors>;
    updateBillingAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
    updateShippingAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
}

interface ShippingState {
    isInitializing: boolean;
    errorInState: boolean;
    showPoBoxError: boolean;
    showPscError: boolean;
    buttonLoading: boolean;
    suggestedAddress: any;
    originalAddress: any;
    selectedAddress: any;
}

class Shipping extends Component<ShippingProps & WithCheckoutShippingProps, ShippingState> {
    // private usStreetClient?: any | null;

    constructor(props: ShippingProps & WithCheckoutShippingProps) {
        super(props);

        this.state = {
            isInitializing: true,
            errorInState: false,
            showPoBoxError: false,
            buttonLoading: false,
            showPscError: false,
            suggestedAddress: null,
            originalAddress: null,
            selectedAddress: 'orignalAddress',
        };
        // const SmartyCore = SmartySDK.core;
        // // const websiteKey = '122541045875848757'; // Your website key here
        // const websiteKey = '112226358730991936'; // Your website key here
        // const smartySharedCredentials = new SmartyCore.SharedCredentials(websiteKey);
        // // const autoCompleteClientBuilder = new SmartyCore.ClientBuilder(smartySharedCredentials).withLicenses(['us-autocomplete-pro-cloud']);
        // const usStreetClientBuilder = new SmartyCore.ClientBuilder(smartySharedCredentials);

        // // this.SmartyCore = SmartyCore;
        // // this.autoCompleteClient = autoCompleteClientBuilder.buildUsAutocompleteProClient();
        // this.usStreetClient = usStreetClientBuilder.buildUsStreetApiClient();
    }

    async componentDidMount(): Promise<void> {
        const {
            loadShippingAddressFields,
            loadShippingOptions,
            onReady = noop,
            onUnhandledError = noop,
        } = this.props;

        try {
            await Promise.all([
                loadShippingAddressFields(),
                loadShippingOptions(),
            ]);

            onReady();
        } catch (error) {
            onUnhandledError(error);
        } finally {
            this.setState({ isInitializing: false });
        }
    }

    render(): ReactNode {
        const {
            isBillingSameAsShipping,
            isGuest,
            shouldShowMultiShipping,
            customer,
            unassignItem,
            updateShippingAddress,
            initializeShippingMethod,
            deinitializeShippingMethod,
            isMultiShippingMode,
            onToggleMultiShipping,
            showAddressNotSelectedError,
            updateAddressSelected,
            ...shippingFormProps
        } = this.props;

        const {
            isInitializing,
            errorInState,
            showPoBoxError,
            buttonLoading,
            showPscError,
            suggestedAddress,
            selectedAddress,
            originalAddress,
        } = this.state;

        return (
            <div className="checkout-form">
                <ShippingHeader
                    isGuest={ isGuest }
                    isMultiShippingMode={ isMultiShippingMode }
                    onMultiShippingChange={ this.handleMultiShippingModeSwitch }
                    shouldShowMultiShipping={ shouldShowMultiShipping }
                />

                <LoadingOverlay
                    isLoading={ isInitializing }
                    unmountContentWhenLoading
                >
                    <ShippingForm
                        { ...shippingFormProps }
                        addresses={ customer.addresses }
                        buttonLoading={ buttonLoading }
                        deinitialize={ deinitializeShippingMethod }
                        initialize={ initializeShippingMethod }
                        isBillingSameAsShipping = { isBillingSameAsShipping }
                        isGuest={ isGuest }
                        isMultiShippingMode={ isMultiShippingMode }
                        onBlur={ this.onBlur }
                        onChangeRadio= { this.onChangeRadio }
                        onMultiShippingSubmit={ this.handleMultiShippingSubmit }
                        onSingleShippingSubmit={ this.handleSingleShippingSubmit }
                        onUseNewAddress={ this.handleUseNewAddress }
                        originalAddress= { originalAddress }
                        selectedAddress={ selectedAddress }
                        shouldShowSaveAddress={ !isGuest }
                        showAddressNotSelectedError = { showAddressNotSelectedError }
                        showErrorInState={ errorInState }
                        showPoBoxError={ showPoBoxError }
                        showPscError = { showPscError }
                        suggestedAddress={ suggestedAddress }
                        updateAddress={ updateShippingAddress }
                        updateAddressSelected={ updateAddressSelected }
                    />
                </LoadingOverlay>
            </div>
        );
    }

    private onBlur:(suggestedAddress?:any, originalAddress?: any) => void = (suggestedAddress = null, originalAddress = null) => {
        this.setState({ suggestedAddress, originalAddress });
    }

    private onChangeRadio:(value: any) => void = (value) => {
        this.setState({ selectedAddress: value });
    }
    private handleMultiShippingModeSwitch: () => void = async () => {
        const {
            consignments,
            isMultiShippingMode,
            onToggleMultiShipping = noop,
            onUnhandledError = noop,
            updateShippingAddress,
        } = this.props;

        if (isMultiShippingMode && consignments.length > 1) {
            this.setState({ isInitializing: true });

            try {
                // Collapse all consignments into one
                await updateShippingAddress(consignments[0].shippingAddress);
            } catch (error) {
                onUnhandledError(error);
            } finally {
                this.setState({ isInitializing: false });
            }
        }

        onToggleMultiShipping();
    };

    private ValidateEmail: (mail: string) => boolean = mail => {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
            return true;
          }

        return false;
    };
// {
//  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(myForm.emailAddr.value))
//   {
//     return (true)
//   }
//     alert("You have entered an invalid email address!")
//     return (false)
// }

    // updateAddressSelected: (value: boolean) => void = (value) => {
    //     console.log(value);
    //     const { updateShowAddressError } = this.props;
    //     if(value) {
    //         this.setState({ addressNotSelected: value });
    //         updateShowAddressError(false);
    //     } else {
    //         this.setState({ addressNotSelected: value });
    //     }
    // }
    private handleSingleShippingSubmit: (values: SingleShippingFormValues) => void = async ({
        billingSameAsShipping,
        shippingAddress: addressValues,
        orderComment,
    }) => {
        // const { addressNotSelected } = this.state;
        const { updateShowAddressError } = this.props;
        const { selectedAddress, suggestedAddress } = this.state;
        const {
            customerMessage,
            updateCheckout,
            updateShippingAddress,
            // updateBillingAddress,
            navigateNextStep,
            onUnhandledError,
            shippingAddress,
            // billingAddress,
            // getBillingAddress,
            // methodId,
        } = this.props;
        updateShowAddressError(false);
        this.setState({ buttonLoading: true }, () => {
            const button = document.getElementById('checkout-customer-continue-as-guest');
        // console.log(button)
        if (button) {
           button.click();
        //    console.log("0000")
        }
        setTimeout(async () => {
            const email = document.getElementById('email') as HTMLInputElement;
            if (this.ValidateEmail(email?.value)) {
                let updatedShippingAddress = addressValues && mapAddressFromFormValues(addressValues);
                if(selectedAddress === 'sugestedAddress') {
                    updatedShippingAddress = suggestedAddress && mapAddressFromFormValues({ ...addressValues, ...suggestedAddress});
                }
                if (updatedShippingAddress?.stateOrProvinceCode === 'HI' || updatedShippingAddress?.stateOrProvinceCode === 'PR') {
                    this.setState({ errorInState: true }, () => {
                        // throw Error('Orders from Hawaii and Puerto Rico will not be accepted at this time.');
                    });

                    this.setState({ buttonLoading: false });
                    return;
                }
                if(updatedShippingAddress?.address1.toLowerCase().includes('po box')) {
                    this.setState({ showPoBoxError: true }, () => {
                        // throw Error('Orders from Hawaii and Puerto Rico will not be accepted at this time.');
                    });
                    this.setState({ buttonLoading: false });
                    return;
                }
                if(updatedShippingAddress?.address1.toLowerCase().includes('psc')) {
                    this.setState({ showPscError: true }, () => {
                        // throw Error('Orders from Hawaii and Puerto Rico will not be accepted at this time.');
                    });
                    this.setState({ buttonLoading: false });
                    return;
                }
                this.setState({ errorInState: false, showPoBoxError: false, showPscError: false });
                const promises: Array<Promise<CheckoutSelectors>> = [];
                // const hasRemoteBilling = this.hasRemoteBilling(methodId);

                if (!isEqualAddress(updatedShippingAddress, shippingAddress)) {
                    promises.push(updateShippingAddress(updatedShippingAddress || {}));
                }

                // if (billingSameAsShipping &&
                //     updatedShippingAddress &&
                //     !isEqualAddress(updatedShippingAddress, billingAddress) &&
                //     !hasRemoteBilling
                // ) {
                //     promises.push(updateBillingAddress(updatedShippingAddress));
                // }

                if (customerMessage !== orderComment) {
                    promises.push(updateCheckout({ customerMessage: orderComment }));
                }

                try {
                    await Promise.all(promises);

                    navigateNextStep(billingSameAsShipping);
                    this.setState({ buttonLoading: false });
                } catch (error) {
                    onUnhandledError(error);
                    this.setState({ buttonLoading: false });
                }
            } else {
                this.setState({ buttonLoading: false });
            }
        }, 5000);
        });
        // else {
        //     const updatedShippingAddress = addressValues && mapAddressFromFormValues(addressValues);
        //     const lookup = new SmartySDK.usStreet.Lookup();
        //     lookup.street = updatedShippingAddress?.address1 || '';
        //     lookup.street2 = updatedShippingAddress?.address2 || '';
        //     lookup.city = updatedShippingAddress?.city || '';
        //     lookup.state = updatedShippingAddress?.stateOrProvince || '';
        //     lookup.zipCode = updatedShippingAddress?.postalCode || '';

        //     if (!!lookup.street) {
        //         this.usStreetClient.send(lookup)
        //             .then((response: any) => {
        //                 const lookup = response.lookups[0];
        //                 const isValid = sdkUtils.isValid(lookup);
        //                 if (!isValid) {
        //                     // newState.error = 'The address is invalid.';
        //                 }
        //                 console.log(response);
        //                 const candidate = lookup.result[0];
        //                 const suggestedAddress = {
        //                     ...updatedShippingAddress,
        //                     address1: candidate.deliveryLine1 as string,
        //                     address2: candidate.deliveryLine2 || '',
        //                     city: candidate.components.cityName as string,
        //                     stateOrProvince: candidate.components.state as string,
        //                     zipCode: `${candidate.components.zipCode}-${candidate.components.plus4Code}`,
        //                     postalCode: `${candidate.components.zipCode}-${candidate.components.plus4Code}`,
        //                 };
        //                 this.setState({ suggestedAddress });
        //             })
        //             .catch(() => this.setState({ suggestedAddress: null }));
        //     } else {
        //         console.log('A street address is required.');
        //     }
        //     updateShowAddressError(true);
        //     // this.setState({ showAddressNotSelectedError: true });
        // }  
    };

    // private hasRemoteBilling: (methodId?: string) => boolean = methodId => {
    //     const PAYMENT_METHOD_VALID = ['amazonpay'];

    //     return PAYMENT_METHOD_VALID.some(method => method === methodId);
    // };

    private handleUseNewAddress: (address: Address, itemId: string) => void = async (address, itemId) => {
        const { unassignItem, onUnhandledError } = this.props;

        try {
            await unassignItem({
                shippingAddress: address,
                lineItems: [{
                    quantity: 1,
                    itemId,
                }],
            });

            location.href = '/account.php?action=add_shipping_address&from=checkout';
        } catch (e) {
            onUnhandledError(new UnassignItemError(e));
        }
    };

    private handleMultiShippingSubmit: (values: MultiShippingFormValues) => void = async ({ orderComment }) => {
        const {
            customerMessage,
            updateCheckout,
            navigateNextStep,
            onUnhandledError,
        } = this.props;

        try {
            if (customerMessage !== orderComment) {
                await updateCheckout({ customerMessage: orderComment });
            }

            navigateNextStep(false);
        } catch (error) {
            onUnhandledError(error);
        }
    };
}

const deleteConsignmentsSelector = createSelector(
    ({ checkoutService: { deleteConsignment } }: CheckoutContextProps) => deleteConsignment,
    ({ checkoutState: { data } }: CheckoutContextProps) => data.getConsignments(),
    (deleteConsignment, consignments) => async () => {
        if (!consignments || !consignments.length) {
            return;
        }

        const [{ data }] = await Promise.all(consignments.map(({ id }) =>
            deleteConsignment(id)
        ));

        return data.getShippingAddress();
    }
);

export function mapToShippingProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutShippingProps | null {
    const {
        data: {
            getCart,
            getCheckout,
            getConfig,
            getCustomer,
            getConsignments,
            getShippingAddress,
            getBillingAddress,
            getShippingAddressFields,
            getShippingCountries,
        },
        statuses: {
            isShippingStepPending,
            isSelectingShippingOption,
            isLoadingShippingOptions,
            isUpdatingConsignment,
            isCreatingConsignments,
            isCreatingCustomerAddress,
            isLoadingShippingCountries,
            isUpdatingBillingAddress,
            isUpdatingCheckout,
            isContinuingAsGuest,
            isInitializingCustomer,
            isExecutingPaymentMethodCheckout
        },
    } = checkoutState;

    const checkout = getCheckout();
    const config = getConfig();
    const consignments = getConsignments() || [];
    const customer = getCustomer();
    const cart = getCart();

    if (!checkout || !config || !customer || !cart) {
        return null;
    }

    const {
        checkoutSettings: {
            enableOrderComments,
            features,
            hasMultiShippingEnabled,
            googleMapsApiKey,
        },
    } = config;

    const methodId = getShippingMethodId(checkout);
    const shippableItemsCount = getShippableItemsCount(cart);
    const isLoading = (
        isLoadingShippingOptions() ||
        isSelectingShippingOption() ||
        isUpdatingConsignment() ||
        isCreatingConsignments() ||
        isUpdatingBillingAddress() ||
        isUpdatingCheckout() ||
        isCreatingCustomerAddress() ||
        isContinuingAsGuest() ||
        isInitializingCustomer() ||
        isExecutingPaymentMethodCheckout()
    );
    const shouldShowMultiShipping = (
        hasMultiShippingEnabled &&
        !methodId &&
        shippableItemsCount > 1 &&
        shippableItemsCount < 50
    );
    const countriesWithAutocomplete = ['US', 'CA', 'AU', 'NZ'];

    if (features['CHECKOUT-4183.checkout_google_address_autocomplete_uk']) {
        countriesWithAutocomplete.push('GB');
    }

    const shippingAddress = !shouldShowMultiShipping && consignments.length > 1 ? undefined : getShippingAddress();

    return {
        assignItem: checkoutService.assignItemsToAddress,
        billingAddress: getBillingAddress(),
        cart,
        consignments,
        countries: getShippingCountries() || EMPTY_ARRAY,
        countriesWithAutocomplete,
        customer,
        customerMessage: checkout.customerMessage,
        createCustomerAddress: checkoutService.createCustomerAddress,
        deinitializeShippingMethod: checkoutService.deinitializeShipping,
        deleteConsignments: deleteConsignmentsSelector({ checkoutService, checkoutState }),
        getFields: getShippingAddressFields,
        getBillingAddress,
        googleMapsApiKey,
        initializeShippingMethod: checkoutService.initializeShipping,
        isGuest: customer.isGuest,
        isInitializing: isLoadingShippingCountries() || isLoadingShippingOptions(),
        isLoading,
        isShippingStepPending: isShippingStepPending(),
        loadShippingAddressFields: checkoutService.loadShippingAddressFields,
        loadShippingOptions: checkoutService.loadShippingOptions,
        methodId,
        shippingAddress,
        shouldShowMultiShipping,
        shouldShowAddAddressInCheckout: features['CHECKOUT-4726.add_address_in_multishipping_checkout'],
        shouldShowOrderComments: enableOrderComments,
        signOut: checkoutService.signOutCustomer,
        unassignItem: checkoutService.unassignItemsToAddress,
        updateBillingAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
        updateShippingAddress: checkoutService.updateShippingAddress,
    };
}

export default withCheckout(mapToShippingProps)(Shipping);
