import React, { Fragment, FunctionComponent } from 'react';

import LoadingSpinner from './LoadingSpinner';

export interface LoadingOverlayProps {
    isLoading: boolean;
    hideContentWhenLoading?: boolean;
    unmountContentWhenLoading?: boolean;
    withOutDiv?: boolean;
}

const LoadingOverlay: FunctionComponent<LoadingOverlayProps> = ({
    children,
    hideContentWhenLoading,
    unmountContentWhenLoading,
    isLoading,
    withOutDiv,
}) => {
    if (withOutDiv) {
        if (hideContentWhenLoading || unmountContentWhenLoading) {
            return (
                <Fragment>
                    <LoadingSpinner isLoading={ isLoading } />
                    { unmountContentWhenLoading && isLoading ? null :
                        <>
                            { children }
                        </> }
                </Fragment>
            );
        }

        return (
            <>
                { children }
                { isLoading && <div className="loadingOverlay optimizedCheckout-overlay" /> }
            </>
        );
    }
    if (hideContentWhenLoading || unmountContentWhenLoading) {
        return (
            <Fragment>
                <LoadingSpinner isLoading={ isLoading } />
                { unmountContentWhenLoading && isLoading ? null :
                    <div
                        style={ {
                            display: hideContentWhenLoading && isLoading ?
                                'none' :
                                undefined,
                        } }
                    >
                        { children }
                    </div> }
            </Fragment>
        );
    }

    return (
        <div className="loadingOverlay-container">
            { children }
            { isLoading && <div className="loadingOverlay optimizedCheckout-overlay" /> }
        </div>
    );
};

export default LoadingOverlay;
