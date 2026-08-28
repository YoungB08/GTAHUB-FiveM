QBShared                            = QBShared or {}

QBShared.ForceJobDefaultDutyAtLogin = true -- true: Force duty state to jobdefaultDuty | false: set duty state from database last saved
QBShared.Jobs                       = {
    ['unemployed'] = {
        label       = 'Thất nghiệp',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Tự do',
                payment = 10
            },
        },
    },
    ['ambulance']  = {
        label       = 'Cứu thương (EMS)',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Thực tập sinh',
                payment = 50
            },
            ['1'] = {
                name    = 'Y tá',
                payment = 75
            },
            ['2'] = {
                name    = 'Bác sĩ',
                payment = 100
            },
            ['3'] = {
                name    = 'Bác sĩ phẫu thuật',
                payment = 125
            },
            ['4'] = {
                name    = 'Trưởng viện',
                isboss  = true,
                payment = 150
            },
        },
    },
    ['realestate'] = {
        label       = 'Bất động sản',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Thực tập sinh',
                payment = 50
            },
            ['1'] = {
                name    = 'Môi giới nhà',
                payment = 75
            },
            ['2'] = {
                name    = 'Môi giới doanh nghiệp',
                payment = 100
            },
            ['3'] = {
                name    = 'Chuyên viên cao cấp',
                payment = 125
            },
            ['4'] = {
                name    = 'Giám đốc',
                isboss  = true,
                payment = 150
            },
        },
    },
    ['taxi']       = {
        label       = 'Taxi',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Tài xế tập sự',
                payment = 50
            },
            ['1'] = {
                name    = 'Tài xế chính thức',
                payment = 75
            },
            ['2'] = {
                name    = 'Tài xế cao cấp',
                payment = 100
            },
            ['3'] = {
                name    = 'Quản lý điều phối',
                payment = 125
            },
            ['4'] = {
                name    = 'Giám đốc',
                isboss  = true,
                payment = 150
            },
        },
    },
    ['bus']        = {
        label       = 'Xe buýt',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Tài xế',
                payment = 50
            },
        },
    },
    ['cardealer']  = {
        label       = 'Đại lý xe',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Thực tập sinh',
                payment = 50
            },
            ['1'] = {
                name    = 'Nhân viên bán hàng',
                payment = 75
            },
            ['2'] = {
                name    = 'Chuyên viên tư vấn',
                payment = 100
            },
            ['3'] = {
                name    = 'Quản lý tài chính',
                payment = 125
            },
            ['4'] = {
                name    = 'Giám đốc showroom',
                isboss  = true,
                payment = 150
            },
        },
    },
    ['mechanic']   = {
        label       = 'Thợ sửa xe',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Học việc',
                payment = 50
            },
            ['1'] = {
                name    = 'Thợ phụ',
                payment = 75
            },
            ['2'] = {
                name    = 'Thợ chính',
                payment = 100
            },
            ['3'] = {
                name    = 'Chuyên viên kỹ thuật',
                payment = 125
            },
            ['4'] = {
                name    = 'Chủ garage',
                isboss  = true,
                payment = 150
            },
        },
    },
    ['judge']      = {
        label       = 'Tòa án',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Thẩm phán',
                payment = 100
            },
        },
    },
    ['lawyer']     = {
        label       = 'Văn phòng Luật',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Luật sư cộng tác',
                payment = 50
            },
        },
    },
    ['reporter']   = {
        label       = 'Truyền thông Báo chí',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Phóng viên',
                payment = 50
            },
        },
    },
    ['trucker']    = {
        label       = 'Tài xế xe tải',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Tài xế giao hàng',
                payment = 50
            },
        },
    },
    ['tow']        = {
        label       = 'Cứu hộ kéo xe',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Tài xế cứu hộ',
                payment = 50
            },
        },
    },
    ['garbage']    = {
        label       = 'Thu gom rác',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Công nhân dọn rác',
                payment = 50
            },
        },
    },
    ['vineyard']   = {
        label       = 'Vườn nho',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Nông dân hái nho',
                payment = 50
            },
        },
    },
    ['hotdog']     = {
        label       = 'Bán Hotdog',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Nhân viên bán xe',
                payment = 50
            },
        },
    },
    ['adsl']   = {
        label       = 'ADSL Viễn thông',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Nhân viên thời vụ',
                payment = 0
            },
        },
    },
    ['livraison']   = {
        label       = 'Giao hàng',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Nhân viên thời vụ',
                payment = 0
            },
        },
    },
    ['religion']   = {
        label       = 'Tôn giáo',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Thành viên thời vụ',
                payment = 0
            },
        },
    },
    ['metal']   = {
        label       = 'Khai khoáng Kim loại',
        defaultDuty = true,
        offDutyPay  = false,
        grades      = {
            ['0'] = {
                name    = 'Nhân viên thời vụ',
                payment = 0
            },
        },
    },
}