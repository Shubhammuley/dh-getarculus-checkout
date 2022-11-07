import { CheckoutSelectors, EmbeddedCheckoutMessenger, EmbeddedCheckoutMessengerOptions, Order, /*ShopperConfig,*/ StepTracker, StoreConfig } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
// import DOMPurify from 'dompurify';
import React, { /*lazy,*/ Component, /*Fragment,*/ ReactNode } from 'react';

// eslint-disable-next-line import/no-internal-modules
import productImage from '../../image/product-img.png';
import { withCheckout, CheckoutContextProps } from '../checkout';
import { ErrorLogger , ErrorModal } from '../common/error';
// import { retry } from '../common/utility';
// import { getPasswordRequirementsFromConfig } from '../customer';
import { isEmbedded, EmbeddedCheckoutStylesheet } from '../embeddedCheckout';
import { CreatedCustomer, /*GuestSignUpForm, PasswordSavedSuccessAlert, SignedUpSuccessAlert,*/ SignUpFormValues } from '../guestSignup';
// import { AccountCreationFailedError, AccountCreationRequirementsError } from '../guestSignup/errors';
import { TranslatedHtml, TranslatedString } from '../locale';
import { Button, ButtonVariant } from '../ui/button';
import { /*LazyContainer,*/ LoadingSpinner } from '../ui/loading';

// import { MobileView } from '../ui/responsive';

// import getPaymentInstructions from './getPaymentInstructions';
// import mapToOrderSummarySubtotalsProps from './mapToOrderSummarySubtotalsProps';
// import OrderConfirmationSection from './OrderConfirmationSection';
// import OrderStatus from './OrderStatus';
// import PrintLink from './PrintLink';
// import ThankYouHeader from './ThankYouHeader';

// const OrderSummary = lazy(() => retry(() => import(
//     /* webpackChunkName: "order-summary" */
//     './OrderSummary'
// )));

// const OrderSummaryDrawer = lazy(() => retry(() => import(
//     /* webpackChunkName: "order-summary-drawer" */
//     './OrderSummaryDrawer'
// )));

export interface OrderConfirmationState {
    error?: Error;
    hasSignedUp?: boolean;
    isSigningUp?: boolean;
}

export interface OrderConfirmationProps {
    containerId: string;
    embeddedStylesheet: EmbeddedCheckoutStylesheet;
    errorLogger: ErrorLogger;
    orderId: number;
    createAccount(values: SignUpFormValues): Promise<CreatedCustomer>;
    createEmbeddedMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger;
    createStepTracker(): StepTracker;
}

interface WithCheckoutOrderConfirmationProps {
    order?: Order;
    config?: StoreConfig;
    loadOrder(orderId: number): Promise<CheckoutSelectors>;
    isLoadingOrder(): boolean;
}

class OrderConfirmation extends Component<
    OrderConfirmationProps & WithCheckoutOrderConfirmationProps,
    OrderConfirmationState
> {
    state: OrderConfirmationState = {};

    private embeddedMessenger?: EmbeddedCheckoutMessenger;

    componentDidMount(): void {
        const {
            containerId,
            createEmbeddedMessenger,
            createStepTracker,
            embeddedStylesheet,
            loadOrder,
            orderId,
        } = this.props;

        const script1 = document.createElement('script');
        script1.src = 'https://app.fintelconnect.com/assets/scripts/fcanalytics.js';
        const script2 = document.createElement('script');
        script2.type = 'text/javascript';
        script2.innerHTML = `
        fetch('/api/storefront/order/${orderId}', {credentials: 'include'})
        .then(function(response) {
            return response.json();
        })
        .then(function(order) {
            var customerId = '';
            var productId = '';
            if (order.lineItems.physicalItems[0].productId) {
              productId = order.lineItems.physicalItems[0].productId;
            } else if (order.lineItems.digitalItems[0].productId) {
              productId = order.lineItems.digitalItems[0].productId;
            }
          fcpixel.pxl(26002,${orderId}, productId, customerId, 0, 0, "", "arculusfc");
        });`;
        const body = document.getElementsByTagName('body')[0];
        body.appendChild(script1);
        body.appendChild(script2);
        loadOrder(orderId)
            .then(({ data }) => {
                const { links: { siteLink = '' } = {} } = data.getConfig() || {};
                const messenger = createEmbeddedMessenger({ parentOrigin: siteLink });

                this.embeddedMessenger = messenger;

                messenger.receiveStyles(styles => embeddedStylesheet.append(styles));
                messenger.postFrameLoaded({ contentId: containerId });

                createStepTracker().trackOrderComplete();
            })
            .catch(this.handleUnhandledError);
    }

    render(): ReactNode {
        const {
            order,
            config,
            isLoadingOrder,
        } = this.props;

        const globleWindow = window as any;
        if (!order || !config || isLoadingOrder()) {
            return <LoadingSpinner isLoading={ true } />;
        }

        // const paymentInstructions = getPaymentInstructions(order);
        const {
            // storeProfile: {
            //     orderEmail,
            //     storePhoneNumber,
            // },
            // shopperConfig,
            links: {
                siteLink,
            },
        } = config;

        return (
            <div className={ classNames(
                'layout optimizedCheckout-contentPrimary',
                { 'is-embedded': isEmbedded() }
            ) }
            >
                <div className="layout-main">
                    <div className="orderConfirmation">
                        { /* <div className="continueButtonContainer">
                            <a href={ siteLink } target="_top">
                                <Button variant={ ButtonVariant.Secondary }>
                                    <TranslatedString id="order_confirmation.continue_shopping" />
                                </Button>
                            </a>
                        </div> */ }
                        <img src={ productImage } />
                    </div>
                </div>

                <div className="cart optimizedCheckout-orderSummary order-confirmation-page" data-test="cart">
                    <h2><TranslatedString id="order_confirmation.order-confirmed" /></h2>
                    <h1>
                        <TranslatedHtml
                            data={ { orderNumber: order.orderId } }
                            id="order_confirmation.order_number_text"
                        />
                    </h1>
                    <p>{ globleWindow?.orderConfirmationLanguage }</p>
                    <a href={ siteLink } target="_top">
                        <Button variant={ ButtonVariant.Secondary }>
                            <TranslatedString id="order_confirmation.back-to-home" />
                        </Button>
                    </a>
                </div>
                { this.renderErrorModal() }
            </div>
        );
    }

    // private renderGuestSignUp({ customerCanBeCreated, shouldShowPasswordForm, shopperConfig }: {
    //     customerCanBeCreated: boolean;
    //     shouldShowPasswordForm: boolean;
    //     shopperConfig: ShopperConfig;
    // }): ReactNode {
    //     const {
    //         isSigningUp,
    //         hasSignedUp,
    //     } = this.state;

    //     const { order } = this.props;

    //     return <Fragment>
    //         { shouldShowPasswordForm && !hasSignedUp && <GuestSignUpForm
    //             customerCanBeCreated={ customerCanBeCreated }
    //             isSigningUp={ isSigningUp }
    //             onSignUp={ this.handleSignUp }
    //             passwordRequirements={ getPasswordRequirementsFromConfig(shopperConfig) }
    //         /> }

    //         { hasSignedUp && (order?.customerId ? <PasswordSavedSuccessAlert /> : <SignedUpSuccessAlert />) }
    //     </Fragment>;
    // }

    // private renderOrderSummary(): ReactNode {
    //     const {
    //         order,
    //         config,
    //     } = this.props;

    //     if (!order || !config) {
    //         return null;
    //     }

    //     const {
    //         currency,
    //         shopperCurrency,
    //     } = config;

    //     return <>
    //         <MobileView>
    //             { matched => {
    //                 if (matched) {
    //                     return <LazyContainer>
    //                         <OrderSummaryDrawer
    //                             { ...mapToOrderSummarySubtotalsProps(order) }
    //                             headerLink={ <PrintLink className="modal-header-link cart-modal-link" /> }
    //                             lineItems={ order.lineItems }
    //                             shopperCurrency={ shopperCurrency }
    //                             storeCurrency={ currency }
    //                             total={ order.orderAmount }
    //                         />
    //                     </LazyContainer>;
    //                 }

    //                 return <aside className="layout-cart">
    //                     <LazyContainer>
    //                         <OrderSummary
    //                             headerLink={ <PrintLink /> }
    //                             { ...mapToOrderSummarySubtotalsProps(order) }
    //                             lineItems={ order.lineItems }
    //                             shopperCurrency={ shopperCurrency }
    //                             storeCurrency={ currency }
    //                             total={ order.orderAmount }
    //                         />
    //                     </LazyContainer>
    //                 </aside>;
    //             } }
    //         </MobileView>
    //     </>;
    // }

    private renderErrorModal(): ReactNode {
        const { error } = this.state;

        return (
            <ErrorModal
                error={ error }
                onClose={ this.handleErrorModalClose }
                shouldShowErrorCode={ false }
            />
        );
    }

    private handleErrorModalClose: () => void = () => {
        this.setState({ error: undefined });
    };

    // private handleSignUp: (values: SignUpFormValues) => void = ({ password, confirmPassword }) => {
    //     const { createAccount, config } = this.props;

    //     const shopperConfig = config && config.shopperConfig;
    //     const passwordRequirements = (shopperConfig &&
    //         shopperConfig.passwordRequirements &&
    //         shopperConfig.passwordRequirements.error) || '';

    //     this.setState({
    //         isSigningUp: true,
    //     });

    //     createAccount({
    //         password,
    //         confirmPassword,
    //     })
    //         .then(() => {
    //             this.setState({
    //                 hasSignedUp: true,
    //                 isSigningUp: false,
    //             });
    //         })
    //         .catch(error => {
    //             this.setState({
    //                 error: (error.status < 500) ?
    //                     new AccountCreationRequirementsError(error, passwordRequirements) :
    //                     new AccountCreationFailedError(error),
    //                 hasSignedUp: false,
    //                 isSigningUp: false,
    //             });
    //         });
    // };

    private handleUnhandledError: (error: Error) => void = error => {
        const { errorLogger } = this.props;

        this.setState({ error });
        errorLogger.log(error);

        if (this.embeddedMessenger) {
            this.embeddedMessenger.postError(error);
        }
    };
}

export function mapToOrderConfirmationProps(
    context: CheckoutContextProps
): WithCheckoutOrderConfirmationProps | null {
    const {
        checkoutState: {
            data: {
                getOrder,
                getConfig,
            },
            statuses: {
                isLoadingOrder,
            },
        },
        checkoutService,
    } = context;

    const config = getConfig();
    const order = getOrder();

    return {
        config,
        isLoadingOrder,
        loadOrder: checkoutService.loadOrder,
        order,
    };
}

export default withCheckout(mapToOrderConfirmationProps)(OrderConfirmation);
