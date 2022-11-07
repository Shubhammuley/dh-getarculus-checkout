import React from 'react';

import Suggestion from './Suggestion';

export interface SuggestionProps {
    suggestions: any;
    selectSuggestion(suggestion: any): void;
}

export default function Suggestions(props: SuggestionProps) {
    const { suggestions, selectSuggestion} = props;
    const suggestionList = suggestions.result;

    return <div className={ 'autocomplete--suggestions' } id={ 'autocomplete--suggestions' }>
        { suggestionList.filter((suggestion: any) => suggestion.entries === 0).map((suggestion: any, key: any) => <Suggestion
            key={ key }
            // eslint-disable-next-line react/jsx-no-bind
            selectSuggestion={ () => selectSuggestion(suggestion) }
            suggestion={ suggestion }
        />) }
    </div>;
}
