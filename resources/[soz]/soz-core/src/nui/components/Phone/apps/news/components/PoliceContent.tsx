import React, { FunctionComponent } from 'react';

import { NewsMessage } from '../../../../../../shared/phone/apps/news';
import { isActivePoliceMessage } from '../utils/isPolice';

export const PoliceContent: FunctionComponent<NewsMessage> = ({ type, message }) => {
    if (!isActivePoliceMessage(type)) {
        return (
            <>
                Lực lượng chức năng đã ngừng truy tìm <strong>{message}</strong>.
            </>
        );
    }

    return (
        <>
            Lực lượng chức năng đang truy tìm <strong>{message}</strong>.
            <br />
            Nếu có thông tin về người này, vui lòng liên hệ{' '}
            <strong className="uppercase">555-{type}</strong>.
        </>
    );
};
