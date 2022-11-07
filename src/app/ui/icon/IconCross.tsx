import React, { FunctionComponent } from 'react';

import withIconContainer from './withIconContainer';

const IconCross: FunctionComponent = () => (
    <svg fill="none" height="12" viewBox="0 0 12 12" width="12" xmlns="http://www.w3.org/2000/svg">
   <path d="M6 11.5C9.03757 11.5 11.5 9.03757 11.5 6C11.5 2.96243 9.03757 0.5 6 0.5C2.96243 0.5 0.5 2.96243 0.5 6C0.5 9.03757 2.96243 11.5 6 11.5Z" fill="white" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
   <path clipRule="evenodd" d="M4.35355 3.64645C4.15829 3.45118 3.84171 3.45118 3.64645 3.64645C3.45118 3.84171 3.45118 4.15829 3.64645 4.35355L5.29289 6L3.64645 7.64645C3.45118 7.84171 3.45118 8.15829 3.64645 8.35355C3.84171 8.54882 4.15829 8.54882 4.35355 8.35355L6 6.70711L7.64645 8.35355C7.84171 8.54882 8.15829 8.54882 8.35355 8.35355C8.54882 8.15829 8.54882 7.84171 8.35355 7.64645L6.70711 6L8.35355 4.35355C8.54882 4.15829 8.54882 3.84171 8.35355 3.64645C8.15829 3.45118 7.84171 3.45118 7.64645 3.64645L6 5.29289L4.35355 3.64645Z" fill="#181A1F" fillRule="evenodd" />
</svg>
);

export default withIconContainer(IconCross);
