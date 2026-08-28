function CreateMakeupMenuItems(makeupMenu, playerId, skin)
    -- Makeup
    makeupMenu:AddTitle({label = "Trang Điểm Mặt"})
    CreateSliderList(makeupMenu, "Kiểu Trang Điểm", skin.Makeup.FullMakeupType, Labels.Makeup, function(value)
        skin.Makeup.FullMakeupType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeOpacitySliderItem(makeupMenu, "Độ Đậm", skin.Makeup.FullMakeupOpacity, function(value)
        skin.Makeup.FullMakeupOpacity = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    makeupMenu:AddCheckbox({label = "Sử dụng màu mặc định", value = skin.Makeup.FullMakeupDefaultColor}):On("change", function(_, value)
        skin.Makeup.FullMakeupDefaultColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(makeupMenu, "Màu Chính", skin.Makeup.FullMakeupPrimaryColor, Colors.Makeup, function(value)
        skin.Makeup.FullMakeupPrimaryColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(makeupMenu, "Màu Phụ", skin.Makeup.FullMakeupSecondaryColor, Colors.Makeup, function(value)
        skin.Makeup.FullMakeupSecondaryColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Blush
    makeupMenu:AddTitle({label = "Phấn Má Hồng"})
    CreateSliderList(makeupMenu, "Kiểu Đánh Má", skin.Makeup.BlushType, Labels.Blush, function(value)
        skin.Makeup.BlushType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeOpacitySliderItem(makeupMenu, "Độ Đậm", skin.Makeup.BlushOpacity, function(value)
        skin.Makeup.BlushOpacity = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(makeupMenu, "Tông Màu Phấn Má", skin.Makeup.BlushColor, Colors.Makeup, function(value)
        skin.Makeup.BlushColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Son môi
    makeupMenu:AddTitle({label = "Son Môi"})
    CreateSliderList(makeupMenu, "Kiểu Son Môi", skin.Makeup.LipstickType, Labels.Lipstick, function(value)
        skin.Makeup.LipstickType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeOpacitySliderItem(makeupMenu, "Độ Đậm", skin.Makeup.LipstickOpacity, function(value)
        skin.Makeup.LipstickOpacity = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(makeupMenu, "Màu Son Môi", skin.Makeup.LipstickColor, Colors.Makeup, function(value)
        skin.Makeup.LipstickColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    return makeupMenu
end

function CreateMakeupMenu(createCharacterMenu, playerId, skin)
    local makeupMenu = MenuV:InheritMenu(createCharacterMenu, {subtitle = "Trang Điểm & Làm Đẹp"})

    makeupMenu:On("open", function()
        CreateMakeupMenuItems(makeupMenu, playerId, skin)
    end)

    makeupMenu:On("close", function()
        makeupMenu:ClearItems()
    end)

    return makeupMenu
end
