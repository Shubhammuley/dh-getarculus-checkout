import { Address, CheckoutRequestBody, CheckoutSelectors, Country, Customer, FormField } from '@bigcommerce/checkout-sdk';
import { noop } from 'lodash';
import React, { Component, ReactNode } from 'react';

import { isEqualAddress, mapAddressFromFormValues } from '../address';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { EMPTY_ARRAY } from '../common/utility';
import { TranslatedString } from '../locale';
import { getShippableItemsCount } from '../shipping';
import { Button } from '../ui/button';
import { Legend } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

import getBillingMethodId from './getBillingMethodId';
import BillingForm, { BillingFormValues } from './BillingForm';

export interface BillingProps {
    isPending: boolean;
    isBillingSameAsShipping?: boolean;
    navigateBackToCustomerAndShippingStep?(): void;
    navigateNextStep(options?: any, isBillingSameAsShipping?: any, step?: string): void;
    updateSameasShipping(checked: boolean): void;
    onReady?(): void;
    onUnhandledError(error: Error): void;
    billingFromCb(formRef: any): void;
}

export interface WithCheckoutBillingProps {
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isInitializing: boolean;
    isInitializingPayment: boolean;
    isUpdating: boolean;
    shouldShowOrderComments: boolean;
    billingAddress?: Address;
    shippingAddress?: Address;
    methodId?: string;
    getFields(countryCode?: string): FormField[];
    initialize(): Promise<CheckoutSelectors>;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;
}

interface BillingFormState {
    addSameAsShipping: boolean;
}

class Billing extends Component<BillingProps & WithCheckoutBillingProps> {

    state: BillingFormState = {
        addSameAsShipping: false,
    };

    getDerivedStateFromProps(props: BillingProps) {
        // console.log( props.isBillingSameAsShipping );

        return { addSameAsShipping: props.isBillingSameAsShipping };
    }
    async componentDidMount(): Promise<void> {
        const {
            initialize,
            onReady = noop,
            onUnhandledError,
        } = this.props;

        window.scrollTo(0, 0);
        try {
            await initialize();
            onReady();
        } catch (e) {
            onUnhandledError(e);
        }
    }

    render(): ReactNode {
        const { addSameAsShipping } = this.state;
        const {
            updateAddress,
            isInitializing,
            isPending,
            isInitializingPayment,
            shippingAddress,
            billingFromCb,
            isBillingSameAsShipping,
            billingAddress,
            navigateBackToCustomerAndShippingStep,
            ...props
        } = this.props;

        const sameAsShipping = addSameAsShipping || isBillingSameAsShipping;
        // console.log('Billing', sameAsShipping);

        return (
            <div className="checkout-form">
                {
                    !isInitializing && !isPending && !isInitializingPayment ? <Button
                        id="checkout-billing-back"
                        onClick={ navigateBackToCustomerAndShippingStep }
                        // style={ { display: 'none' } }
                        type="submit"
                    >
                    Back
                </Button> : null
                }

                <div className="form-legend-container">
                    <Legend testId="billing-address-heading">
                        <TranslatedString id="billing.billing_address_heading" />
                    </Legend>
                </div>

                <LoadingOverlay
                    isLoading={ isInitializing }
                    // unmountContentWhenLoading
                >
                    <BillingForm
                        { ...props }
                        billingAddress={ billingAddress }
                        billingFromCb={ billingFromCb }
                        manageCheckBoxStateCb={ this.onChangeOfCheckox }
                        onSubmit={ this.handleSubmit }
                        sameAsShipping = { sameAsShipping as boolean }
                        shippingAddress={ shippingAddress }
                        updateAddress={ updateAddress }
                    />
                </LoadingOverlay>
            </div>
        );
    }

    private onChangeOfCheckox: (isChecked: boolean) => void = isChecked => {
        // const {
        //     updateAddress,
        //     shippingAddress,
        // } = this.props;
        const {
            updateSameasShipping,
        } = this.props;
        this.setState({ addSameAsShipping: isChecked });
        updateSameasShipping(isChecked);
        // if (isChecked && shippingAddress) {
        //     await updateAddress(shippingAddress);
        // } else {
        //     await  updateAddress({});
        // }
    };

    private handleSubmit: (values: BillingFormValues) => void = async ({
        orderComment,
        ...addressValues
    }) => {
        const {
            updateAddress,
            updateCheckout,
            customerMessage,
            billingAddress,
            navigateNextStep,
            onUnhandledError,
            shippingAddress,
        } = this.props;

        const { addSameAsShipping } = this.state;
        let sameAsShipping = addSameAsShipping;
        const promises: Array<Promise<CheckoutSelectors>> = [];
        const address = mapAddressFromFormValues(addressValues);

        const checkBox = document.getElementById('sameAsBilling') as HTMLInputElement;
        if (checkBox && checkBox?.checked && shippingAddress) {
          const finalShipAddress: any = {...shippingAddress};
          delete finalShipAddress?.email;
        //   await updateAddress({ ...finalShipAddress });
          sameAsShipping = true;
          promises.push(updateAddress(finalShipAddress));
        } else {
            if (!sameAsShipping && address && !isEqualAddress(address, billingAddress)) {
                promises.push(updateAddress(address));
            }
            if (!address && sameAsShipping && shippingAddress) {
                promises.push(updateAddress(shippingAddress));
            }
            if (customerMessage !== orderComment) {
                promises.push(updateCheckout({ customerMessage: orderComment }));
            }
        }

        try {
            await Promise.all(promises);
            const paymentSection = document.getElementById('payment-section');
            if (paymentSection) {
                paymentSection.style.pointerEvents = 'auto';
                paymentSection.style.opacity = '1';
            }
            navigateNextStep(null, sameAsShipping, 'billing');
        } catch (error) {
            onUnhandledError(error);
        }
    };
}

function mapToBillingProps({
    checkoutService,
    checkoutState,
}: CheckoutContextProps): WithCheckoutBillingProps | null {
    const {
        data: {
            getCheckout,
            getConfig,
            getCart,
            getCustomer,
            getBillingAddress,
            getBillingAddressFields,
            getBillingCountries,
            getShippingAddress,
        },
        statuses: {
            isLoadingBillingCountries,
            isUpdatingBillingAddress,
            isUpdatingCheckout,
            isInitializingPayment,
        },
    } = checkoutState;

    const config = getConfig();
    const customer = getCustomer();
    const checkout = getCheckout();
    const cart = getCart();

    if (!config || !customer || !checkout || !cart) {
        return null;
    }

    const {
        enableOrderComments,
        googleMapsApiKey,
        features,
    } = config.checkoutSettings;

    const countriesWithAutocomplete = ['US', 'CA', 'AU', 'NZ'];

    if (features['CHECKOUT-4183.checkout_google_address_autocomplete_uk']) {
        countriesWithAutocomplete.push('GB');
    }

    return {
        billingAddress: getBillingAddress(),
        countries: getBillingCountries() || EMPTY_ARRAY,
        countriesWithAutocomplete,
        customer,
        customerMessage: checkout.customerMessage,
        getFields: getBillingAddressFields,
        googleMapsApiKey,
        initialize: checkoutService.loadBillingAddressFields,
        isInitializing: isLoadingBillingCountries(),
        isInitializingPayment: isInitializingPayment(),
        isUpdating: isUpdatingBillingAddress() || isUpdatingCheckout(),
        methodId: getBillingMethodId(checkout),
        shouldShowOrderComments: enableOrderComments && getShippableItemsCount(cart) < 1,
        shippingAddress: getShippingAddress(),
        updateAddress: checkoutService.updateBillingAddress,
        updateCheckout: checkoutService.updateCheckout,
    };
}

export default withCheckout(mapToBillingProps)(Billing);
