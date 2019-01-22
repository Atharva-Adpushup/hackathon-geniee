import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router-dom';
import App from './App';
import './scss/index.scss';

render(<App />, document.querySelector('#root'));
