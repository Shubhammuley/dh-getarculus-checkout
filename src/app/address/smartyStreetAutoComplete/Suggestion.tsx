/* eslint-disable react/jsx-no-bind */
import React, { Component } from 'react';

export interface SuggestionProps {
    suggestion: any;
    key: any;
    selectSuggestion(suggestion: any): void;
}

export interface SuggestionState {
    isHovered: boolean;
}

export default class Suggestion extends Component<SuggestionProps, SuggestionState > {
    constructor(props: SuggestionProps) {
        super(props);

        this.state = {
            isHovered: false,
        };

        this.formatAutocompleteSuggestion = this.formatAutocompleteSuggestion.bind(this);
        this.setIsHovered = this.setIsHovered.bind(this);
        this.buildResultHoverClass = this.buildResultHoverClass.bind(this);
    }

    formatAutocompleteSuggestion(suggestion: any) {
        const street = suggestion.streetLine ? `${suggestion.streetLine} ` : '';
        const secondary = suggestion?.secondary ? `${suggestion.secondary} ` : '';
        const entries = suggestion?.entries > 1 ? `(${suggestion.entries} more entries) ` : '';
        const city = suggestion?.city ? `${suggestion.city} ` : '';
        const state = suggestion?.state ? `${suggestion.state}, ` : '';
        const zip = suggestion?.zipcode ? `${suggestion.zipcode}` : '';

        return <>
            { street + secondary }
            <strong>{ entries + city + state + zip }</strong>
          </>;
    }

    setIsHovered(isHovered: boolean) {
        this.setState({isHovered});
    }

    buildResultHoverClass() {
        const className = 'autocomplete--suggestion';
        const { isHovered } = this.state;

        return isHovered ? className + ' autocomplete--suggestion-hover' : className;
    }

    render() {
        const {
            selectSuggestion,
            suggestion,
        } = this.props;

        return (
            <div
                className={ this.buildResultHoverClass() }
                id={ 'autocomplete--suggestion' }
                onClick={ selectSuggestion }
                onMouseEnter={ () => this.setIsHovered(true) }
                onMouseLeave={ () => this.setIsHovered(false) }
            >
                { this.formatAutocompleteSuggestion(suggestion) }
            </div>
        );
    }
}
