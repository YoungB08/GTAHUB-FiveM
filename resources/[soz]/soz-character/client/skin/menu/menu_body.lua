local function CreateBodyMenuItems(bodyMenu, playerId, skin)
    -- Peau
    bodyMenu:AddTitle({label = "Làn Da"})

    CreateSliderList(bodyMenu, "Nếp Nhăn", skin.FaceTrait.Ageing, Labels.Blemish, function(value)
        skin.FaceTrait.Ageing = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateSliderList(bodyMenu, "Tàn Nhang & Khuyết Điểm", skin.FaceTrait.Blemish, Labels.Blemish, function(value)
        skin.FaceTrait.Blemish = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateSliderList(bodyMenu, "Vết Đỏ / Mụn Đỏ", skin.FaceTrait.Complexion, Labels.Complexion, function(value)
        skin.FaceTrait.Complexion = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateSliderList(bodyMenu, "Nốt Ruồi", skin.FaceTrait.Moles, Labels.Moles, function(value)
        skin.FaceTrait.Moles = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Menton
    bodyMenu:AddTitle({label = "Cằm"})

    CreateRangeSizeItem(bodyMenu, "Độ Rộng Cằm", skin.FaceTrait.ChimpBoneWidth or 0.0, function(value)
        skin.FaceTrait.ChimpBoneWidth = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Dài Cằm", skin.FaceTrait.ChimpBoneLength or 0.0, function(value)
        skin.FaceTrait.ChimpBoneLength = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Nhô Cằm", skin.FaceTrait.ChimpBoneLower or 0.0, function(value)
        skin.FaceTrait.ChimpBoneLower = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Cằm Chẻ (Rãnh Cằm)", skin.FaceTrait.ChimpHole or 0.0, function(value)
        skin.FaceTrait.ChimpHole = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Front
    bodyMenu:AddTitle({label = "Trán"})

    CreateRangeSizeItem(bodyMenu, "Độ Cao Trán", skin.FaceTrait.EyebrowHigh or 0.0, function(value)
        skin.FaceTrait.EyebrowHigh = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Nhô Trán", skin.FaceTrait.EyebrowForward or 0.0, function(value)
        skin.FaceTrait.EyebrowForward = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Yeux
    bodyMenu:AddTitle({label = "Mắt"})

    CreateSliderList(bodyMenu, "Màu Mắt", skin.FaceTrait.EyeColor, Labels.Eye, function(value)
        skin.FaceTrait.EyeColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Mở Mắt", skin.FaceTrait.EyesOpening, function(value)
        skin.FaceTrait.EyesOpening = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Nez
    bodyMenu:AddTitle({label = "Mũi"})

    CreateRangeSizeItem(bodyMenu, "Độ Rộng Cánh Mũi", skin.FaceTrait.NoseWidth, function(value)
        skin.FaceTrait.NoseWidth = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Cao Đầu Mũi", skin.FaceTrait.NosePeakHeight, function(value)
        skin.FaceTrait.NosePeakHeight = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Dài Đầu Mũi", skin.FaceTrait.NosePeakLength, function(value)
        skin.FaceTrait.NosePeakLength = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Cao Sống Mũi", skin.FaceTrait.NoseBoneHigh, function(value)
        skin.FaceTrait.NoseBoneHigh = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Góc Cụp Mũi", skin.FaceTrait.NosePeakLower, function(value)
        skin.FaceTrait.NosePeakLower = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Lệch Mũi", skin.FaceTrait.NoseBoneTwist, function(value)
        skin.FaceTrait.NoseBoneTwist = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Joues
    bodyMenu:AddTitle({label = "Gò Má"})

    CreateRangeSizeItem(bodyMenu, "Độ Cao Gò Má", skin.FaceTrait.CheeksBoneHigh, function(value)
        skin.FaceTrait.CheeksBoneHigh = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Rộng Xương Gò Má", skin.FaceTrait.CheeksBoneWidth, function(value)
        skin.FaceTrait.CheeksBoneWidth = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Đầy Đặn Má", skin.FaceTrait.CheeksWidth, function(value)
        skin.FaceTrait.CheeksWidth = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Bouche
    bodyMenu:AddTitle({label = "Môi & Miệng"})

    CreateRangeSizeItem(bodyMenu, "Độ Dày Môi", skin.FaceTrait.LipsThickness, function(value)
        skin.FaceTrait.LipsThickness = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Machoire
    bodyMenu:AddTitle({label = "Xương Quai Hàm"})
    CreateRangeSizeItem(bodyMenu, "Độ Bè Quai Hàm", skin.FaceTrait.JawBoneWidth, function(value)
        skin.FaceTrait.JawBoneWidth = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(bodyMenu, "Độ Nhô Quai Hàm", skin.FaceTrait.JawBoneBackLength, function(value)
        skin.FaceTrait.JawBoneBackLength = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Cou
    bodyMenu:AddTitle({label = "Cổ"})

    CreateRangeSizeItem(bodyMenu, "Độ Dày Cổ", skin.FaceTrait.NeckThickness, function(value)
        skin.FaceTrait.NeckThickness = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Corps
    bodyMenu:AddTitle({label = "Cơ Thể & Da Dẻ"})

    CreateSliderList(bodyMenu, "Khuyết Điểm Thân Thể", skin.FaceTrait.BodyBlemish, Labels.BodyBlemishes, function(value)
        skin.FaceTrait.BodyBlemish = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateSliderList(bodyMenu, "Tàn Nhang Cơ Thể", skin.FaceTrait.AddBodyBlemish, Labels.AddBodyBlemishes, function(value)
        skin.FaceTrait.AddBodyBlemish = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    return bodyMenu
end

function CreateBodyMenu(createCharacterMenu, playerId, skin)
    local bodyMenu = MenuV:InheritMenu(createCharacterMenu, {subtitle = "Khuôn Mặt & Thể Hình"})

    bodyMenu:On("open", function()
        CreateBodyMenuItems(bodyMenu, playerId, skin)
    end)

    bodyMenu:On("close", function()
        bodyMenu:ClearItems()
    end)

    return bodyMenu
end
