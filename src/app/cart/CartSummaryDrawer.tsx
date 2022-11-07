import React, { memo, FunctionComponent } from 'react';

import { withCheckout } from '../checkout';
import OrderSummaryDrawer from '../order/OrderSummaryDrawer';

import mapToCartSummaryProps from './mapToCartSummaryProps';
import withRedeemable from './withRedeemable';
import { WithCheckoutCartSummaryProps } from './CartSummary';
// import EditLink from './EditLink';

const CartSummaryDrawer: FunctionComponent<WithCheckoutCartSummaryProps> = ({
    cartUrl,
    ...props
}) => (
    withRedeemable(OrderSummaryDrawer)({
        ...props,
        cartUrl,
        headerLink: (
            <></>
        ),
    })
);

export default withCheckout(mapToCartSummaryProps)(memo(CartSummaryDrawer));
