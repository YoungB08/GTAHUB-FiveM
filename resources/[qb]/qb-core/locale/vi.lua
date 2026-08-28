local Translations = {
    error = {
        not_online = 'Người chơi không trực tuyến',
        wrong_format = 'Sai định dạng',
        missing_args = 'Thiếu tham số (x, y, z)',
        missing_args2 = 'Phải điền đầy đủ tất cả các tham số!',
        no_access = 'Bạn không có quyền sử dụng lệnh này',
        company_too_poor = 'Doanh nghiệp của bạn không đủ tiền',
        item_not_exist = 'Vật phẩm không tồn tại',
        too_heavy = 'Túi đồ đã đầy'
    },
    success = {},
    info = {
        received_paycheck = 'Bạn đã nhận được tiền lương: $%{value}',
        job_info = 'Nghề nghiệp: %{value} | Cấp bậc: %{value2} | Trạng thái: %{value3}',
        gang_info = 'Băng đảng: %{value} | Cấp bậc: %{value2}',
        on_duty = 'Bạn đã vào ca làm việc!',
        off_duty = 'Bạn đã rời ca làm việc!'
    }
}

Lang = Locale:new({phrases = Translations, warnOnMissing = true})
