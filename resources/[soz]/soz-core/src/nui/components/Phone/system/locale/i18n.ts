import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { fr } from './fr';
import { vi } from './vi';

i18n.use(initReactI18next).init({
    lng: 'vi',
    saveMissing: true,
    fallbackLng: 'vi',
    interpolation: {
        escapeValue: false,
    },
    resources: { vi, fr },
});

export default i18n;
