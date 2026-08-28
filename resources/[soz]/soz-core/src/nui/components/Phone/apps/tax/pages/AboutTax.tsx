import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import { useAssetPath } from '../../../../../hook/assets';
import { AppContent } from '../../../components/system/AppContent';
import { AppWrapper } from '../../../components/system/AppWrapper';
import { useAppTitleGetBackUpdater } from '../../../system/apps/hooks/useAppTitleGetBackUpdater';
import { useThemeConfig } from '../../../system/config/config.atom';

export const AboutTax = () => {
    const navigate = useNavigate();

    const theme = useThemeConfig();
    const { getPath } = useAssetPath();

    useAppTitleGetBackUpdater(() => navigate(-1));

    return (
        <AppWrapper>
            <AppContent>
                <div className="flex justify-center mt-8">
                    <img src={getPath('images/phone/apps/tax/icon/question.webp')} alt="taxes" className="h-16" />
                </div>
                <div className="pt-4 flex justify-center mb-12 py-1">
                    <h1
                        className={clsx(
                            [
                                {
                                    'text-gray-100': theme === 'dark',
                                    'text-gray-700': theme === 'light',
                                },
                            ],
                            'text-xl font-bold'
                        )}
                    >
                        Les taxes, c'est <span className="font-semibold text-green-500 text-xl">quoi?</span>
                    </h1>
                </div>
                <div
                    className={clsx(
                        [
                            {
                                'text-gray-100': theme === 'dark',
                                'text-gray-700': theme === 'light',
                            },
                        ],
                        'flex flex-col gap-4 overflow-auto'
                    )}
                >
                    <section className="flex flex-col gap-4">
                        <span className="font-semibold text-green-500 text-lg">Thuế là gì?</span>
                        <span className="text-m">
                            Thuế là khoản đóng góp tài chính bắt buộc do Chính phủ áp đặt đối với
                            thu nhập, hàng hóa, giao dịch và dịch vụ. Nó là nguồn thu nhập
                            cần thiết cho Nhà nước, giúp Nhà nước có thể tài trợ cho nhiều dịch vụ công khác nhau như
                            giáo dục, y tế và cơ sở hạ tầng.
                        </span>
                    </section>
                    <section className="flex flex-col gap-4">
                        <span className="font-semibold text-green-500 text-lg">Mục tiêu thuế</span>
                        <span className="text-m">
                            Thuế được sử dụng không chỉ cho các dịch vụ công. Chúng cũng được sử dụng
                            để tác động đến hành vi kinh tế, chẳng hạn như khuyến khích việc áp dụng các thực tiễn
                            sinh thái hoặc ngăn cản việc tiêu thụ các sản phẩm có hại.
                        </span>
                    </section>
                </div>
            </AppContent>
        </AppWrapper>
    );
};
