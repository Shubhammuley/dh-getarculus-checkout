import { Address, CheckoutSelectors, Country, Customer, FormField } from '@bigcommerce/checkout-sdk';
import { withFormik, FormikProps } from 'formik';
import React, { createRef, PureComponent, ReactNode, RefObject } from 'react';
import { lazy } from 'yup';

import { getAddressFormFieldsValidationSchema, getTranslateAddressError, isValidCustomerAddress, mapAddressToFormValues, AddressForm, AddressFormValues, AddressSelect } from '../address';
import { getCustomFormFieldsValidationSchema } from '../formFields';
import { withLanguage, WithLanguageProps } from '../locale';
// import { OrderComments } from '../orderComments';
// eslint-disable-next-line import/no-internal-modules
import BillingSameAsShippingField from '../shipping/BillingSameAsShippingField';
import { Button, ButtonVariant } from '../ui/button';
import { Fieldset, Form } from '../ui/form';
import { LoadingOverlay } from '../ui/loading';

// import StaticBillingAddress from './StaticBillingAddress';

export type BillingFormValues = AddressFormValues & { orderComment: string };

export interface BillingFormProps {
    billingAddress?: Address;
    shippingAddress?: Address;
    countries: Country[];
    countriesWithAutocomplete: string[];
    customer: Customer;
    customerMessage: string;
    googleMapsApiKey: string;
    isUpdating: boolean;
    methodId?: string;
    shouldShowOrderComments: boolean;
    sameAsShipping: boolean;
    manageCheckBoxStateCb(isChecked: boolean): void;
    // updateSameasShipping(checked: boolean): void;
    getFields(countryCode?: string): FormField[];
    onSubmit(values: BillingFormValues): void;
    onUnhandledError(error: Error): void;
    updateAddress(address: Partial<Address>): Promise<CheckoutSelectors>;
    billingFromCb(formRef: any): void;
}

interface BillingFormState {
    isResettingAddress: boolean;
    addSameAsShipping: boolean;
    // renderer?: string | null;
}

class BillingForm extends PureComponent<BillingFormProps & WithLanguageProps & FormikProps<BillingFormValues>, BillingFormState> {
    state: BillingFormState = {
        isResettingAddress: false,
        addSameAsShipping: false,
        // renderer: null,
    };

    private addressFormRef: RefObject<HTMLFieldSetElement> = createRef();

    getDerivedStateFromProps(props: BillingFormProps) {
        return { addSameAsShipping: props.sameAsShipping };
    }
    // private fromRef: RefObject<HTMLFieldSetElement> = createRef();

    componentDidMount() {
      const { addSameAsShipping } = this.state;
      const { sameAsShipping } = this.props;
      if (addSameAsShipping || sameAsShipping) {
          const checkBox = document.getElementById('sameAsBilling') as HTMLInputElement;
          if (checkBox) {
             checkBox.checked = true;
          }
      }
    }

    componentDidUpdate() {
        const { addSameAsShipping } = this.state;
        const { sameAsShipping } = this.props;
        if (addSameAsShipping || sameAsShipping) {
            const checkBox = document.getElementById('sameAsBilling') as HTMLInputElement;
            if (checkBox) {
               checkBox.checked = true;
            }
        }
      }
    render(): ReactNode {
        const {
            googleMapsApiKey,
            billingAddress,
            countriesWithAutocomplete,
            customer: { addresses, isGuest },
            getFields,
            countries,
            isUpdating,
            setFieldValue,
            // shouldShowOrderComments,
            values,
            methodId,
            onSubmit,
            sameAsShipping,
            // updateAddress,
        } = this.props;

        const { addSameAsShipping } = this.state;
        // console.log("Billing form-----", sameAsShipping, addSameAsShipping);

        const shouldRenderStaticAddress = methodId === 'amazonpay';
        const allFormFields = getFields(values.countryCode);
        const customFormFields = allFormFields.filter(({ custom }) => custom);
        const hasCustomFormFields = customFormFields.length > 0;
        const editableFormFields = shouldRenderStaticAddress && hasCustomFormFields ? customFormFields : allFormFields;
        const { isResettingAddress } = this.state;
        const hasAddresses = addresses && addresses.length > 0;
        const hasValidCustomerAddress = billingAddress &&
            isValidCustomerAddress(billingAddress, addresses, getFields(billingAddress.countryCode));

        const showCheckBox = addSameAsShipping || sameAsShipping;

        return (
            <Form autoComplete="on" callBackFunc={ this.callBackFunc } id="billing-page" initialValues={ billingAddress }>
                { /* { shouldRenderStaticAddress && billingAddress &&
                    <div className={ 'form-fieldset' }>
                        <StaticBillingAddress address={ billingAddress } />
                    </div> } */ }
                    <div className="form-body">
                            <BillingSameAsShippingField onChange={ this.onChangeOfCheckox } />
                        </div>

                {
                    showCheckBox ? null : <>
                    <Fieldset id="checkoutBillingAddress" ref={ this.addressFormRef }>
                    { hasAddresses && !shouldRenderStaticAddress &&
                        <Fieldset id="billingAddresses">
                            <LoadingOverlay isLoading={ isResettingAddress }>
                                <AddressSelect
                                    addresses={ addresses }
                                    onSelectAddress={ this.handleSelectAddress }
                                    onUseNewAddress={ this.handleUseNewAddress }
                                    selectedAddress={ hasValidCustomerAddress ? billingAddress : undefined }
                                />
                            </LoadingOverlay>
                        </Fieldset> }

                    { !hasValidCustomerAddress &&
                        <LoadingOverlay isLoading={ isResettingAddress }>
                            <AddressForm
                                countries={ countries }
                                countriesWithAutocomplete={ countriesWithAutocomplete }
                                countryCode={ values.countryCode }
                                formFields={ editableFormFields }
                                googleMapsApiKey={ googleMapsApiKey }
                                // onChange={ this.handleOnChange }
                                isBillingAddress= { true }
                                setFieldValue={ setFieldValue }
                                shouldShowSaveAddress={ !isGuest }
                            />
                        </LoadingOverlay> }
                </Fieldset>
                    </>
                }

                { /* { shouldShowOrderComments &&
                    <OrderComments /> } */ }

                <div className="form-actions">
                    {
                        addSameAsShipping || sameAsShipping ? (
                            <>
                              <Button
                                  disabled={ isUpdating || isResettingAddress }
                                  id="checkout-billing-continue"
                                  isLoading={ isUpdating || isResettingAddress }
                                  // eslint-disable-next-line react/jsx-no-bind
                                  onClick={ () => onSubmit({ orderComment: '' } as BillingFormValues) }
                                  variant={ ButtonVariant.Primary }
                              >
                                  SAVE AND PROCEED TO PAYMENT
                                { /* <TranslatedString id="common.continue_action" /> */ }
                            </Button>
                            </>
                        ) : (
                            <>
                            <Button
                                disabled={ isUpdating || isResettingAddress }
                                id="checkout-billing-continue"
                                isLoading={ isUpdating || isResettingAddress }
                                type="submit"
                                variant={ ButtonVariant.Primary }
                            >
                                SAVE AND PROCEED TO PAYMENT
                                { /* <TranslatedString id="common.continue_action" /> */ }
                            </Button>
                            </>
                        )
                    }
                </div>
            </Form>
        );
    }

    // componentDidMount: () => void = () => {
    //     const { billingFromCb } = this.props;
    //     billingFromCb(this.fromRef);
    // };
    private onChangeOfCheckox: (isChecked: boolean) => void = isChecked => {
        // const { sameAsShipping } = this.props;
        // if (sameAsShipping) {
        //     this.setState({ renderer: new Date().toISOString() });
        // }
        const { manageCheckBoxStateCb } = this.props;
        this.setState({ addSameAsShipping: isChecked },  () => {
            manageCheckBoxStateCb(isChecked);
            // if (isChecked && shippingAddress) {
            //     await updateAddress(shippingAddress);
            // } else {
            //     await  updateAddress({});
            // }
        });
        // manageCheckBoxStateCb(isChecked);
    };

    private callBackFunc: (formRef: any) => void = formRef => {
        const { billingFromCb } = this.props;
        billingFromCb(formRef);
    };
    // private handleOnChange: (fieldName: string, value: string | string[]) => void = (fieldName, value) => {
    //     // const {
    //     //     updateAddress,
    //     //     onUnhandledError,
    //     // } = this.props;

    //     // try {
    //     //     await updateAddress({ [fieldName]: value });
    //     // } catch (e) {
    //     //     console.log(e);
    //     //     onUnhandledError(e);
    //     // }
    //     // console.log(fieldName, value);
    // };

    private handleSelectAddress: (address: Partial<Address>) => void = async address => {
        const {
            updateAddress,
            onUnhandledError,
        } = this.props;

        this.setState({ isResettingAddress: true });

        try {
            // console.log(address);
            await updateAddress(address);
        } catch (e) {
            onUnhandledError(e);
        } finally {
            this.setState({ isResettingAddress: false });
        }
    };

    private handleUseNewAddress: () => void = () => {
        this.handleSelectAddress({});
    };
}

export default withLanguage(withFormik<BillingFormProps & WithLanguageProps, BillingFormValues>({
    handleSubmit: async (values, { props: { onSubmit } }) => {
        // console.log("------")
        await onSubmit(values);
    },
    mapPropsToValues: ({ getFields, customerMessage, billingAddress }) => (
        {
        ...mapAddressToFormValues(
            getFields(billingAddress && billingAddress.countryCode),
            billingAddress
        ),
        orderComment: customerMessage,
    }),
    isInitialValid: ({
        billingAddress,
        getFields,
        language,
    }) => (
        !!billingAddress && getAddressFormFieldsValidationSchema({
            language,
            formFields: getFields(billingAddress.countryCode),
        }).isValidSync(billingAddress)
    ),
    validationSchema: ({
        language,
        getFields,
        methodId,
    }: BillingFormProps & WithLanguageProps) => methodId === 'amazonpay' ?
        (lazy<Partial<AddressFormValues>>(values => getCustomFormFieldsValidationSchema({
            translate: getTranslateAddressError(language),
            formFields: getFields(values && values.countryCode),
        }))) :
        (lazy<Partial<AddressFormValues>>(values => getAddressFormFieldsValidationSchema({
            language,
            formFields: getFields(values && values.countryCode),
        }))),
    enableReinitialize: true,
})(BillingForm));
