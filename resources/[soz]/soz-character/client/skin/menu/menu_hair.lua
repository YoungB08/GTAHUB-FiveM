local function CreateMaleHairItems(hairMenu, playerId, skin)
    -- Cheveux
    hairMenu:AddTitle({label = "Mái Tóc"})
    local hairlist = {};
    for _, v in pairs(Labels.HairMale) do
        if not v.Collection then
            table.insert(hairlist, v)
        end
    end
    CreateSliderList(hairMenu, "Kiểu Tóc", skin.Hair.HairType, hairlist, function(value)
        skin.Hair.HairType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(hairMenu, "Màu Tóc Chính", skin.Hair.HairColor, Colors.Hair, function(value)
        skin.Hair.HairColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(hairMenu, "Màu Nhuộm Highlight", skin.Hair.HairSecondaryColor, Colors.Hair, function(value)
        skin.Hair.HairSecondaryColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Sourcils
    hairMenu:AddTitle({label = "Lông Mày"})
    CreateSliderList(hairMenu, "Dáng Lông Mày", skin.Hair.EyebrowType, Labels.Eyebrow, function(value)
        skin.Hair.EyebrowType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeOpacitySliderItem(hairMenu, "Độ Rậm", skin.Hair.EyebrowOpacity, function(value)
        skin.Hair.EyebrowOpacity = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(hairMenu, "Màu Lông Mày", skin.Hair.EyebrowColor, Colors.Hair, function(value)
        skin.Hair.EyebrowColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(hairMenu, "Độ Nhô", skin.FaceTrait.EyebrowForward, function(value)
        skin.FaceTrait.EyebrowForward = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Barbe
    hairMenu:AddTitle({label = "Bộ Râu"})
    CreateSliderList(hairMenu, "Kiểu Râu", skin.Hair.BeardType, Labels.BeardMale, function(value)
        skin.Hair.BeardType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeOpacitySliderItem(hairMenu, "Độ Rậm Râu", skin.Hair.BeardOpacity, function(value)
        skin.Hair.BeardOpacity = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(hairMenu, "Màu Râu", skin.Hair.BeardColor, Colors.Hair, function(value)
        skin.Hair.BeardColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Poils
    hairMenu:AddTitle({label = "Lông Thân Thể"})
    CreateSliderList(hairMenu, "Kiểu Lông Ngực", skin.Hair.ChestHairType, Labels.ChestHair, function(value)
        skin.Hair.ChestHairType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeOpacitySliderItem(hairMenu, "Độ Rậm", skin.Hair.ChestHairOpacity, function(value)
        skin.Hair.ChestHairOpacity = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(hairMenu, "Màu Lông", skin.Hair.ChestHairColor, Colors.Hair, function(value)
        skin.Hair.ChestHairColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
end

local function CreateFemaleHairItems(hairMenu, playerId, skin)
    -- Cheveux
    hairMenu:AddTitle({label = "Mái Tóc"})
    local hairlist = {};
    for _, v in pairs(Labels.HairFemale) do
        if not v.Collection then
            table.insert(hairlist, v)
        end
    end
    CreateSliderList(hairMenu, "Kiểu Tóc", skin.Hair.HairType, hairlist, function(value)
        skin.Hair.HairType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(hairMenu, "Màu Tóc Chính", skin.Hair.HairColor, Colors.Hair, function(value)
        skin.Hair.HairColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Sourcils
    hairMenu:AddTitle({label = "Lông Mày"})
    CreateSliderList(hairMenu, "Dáng Lông Mày", skin.Hair.EyebrowType, Labels.Eyebrow, function(value)
        skin.Hair.EyebrowType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeOpacitySliderItem(hairMenu, "Độ Rậm", skin.Hair.EyebrowOpacity, function(value)
        skin.Hair.EyebrowOpacity = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(hairMenu, "Màu Lông Mày", skin.Hair.EyebrowColor, Colors.Hair, function(value)
        skin.Hair.EyebrowColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeSizeItem(hairMenu, "Độ Nhô", skin.FaceTrait.EyebrowForward, function(value)
        skin.FaceTrait.EyebrowForward = value
        ApplyPlayerBodySkin(playerId, skin)
    end)

    -- Poils
    hairMenu:AddTitle({label = "Lông Thân Thể"})
    CreateSliderList(hairMenu, "Kiểu Lông Ngực", skin.Hair.ChestHairType, Labels.ChestHair, function(value)
        skin.Hair.ChestHairType = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateRangeOpacitySliderItem(hairMenu, "Độ Rậm", skin.Hair.ChestHairOpacity, function(value)
        skin.Hair.ChestHairOpacity = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
    CreateColorSliderList(hairMenu, "Màu Lông", skin.Hair.ChestHairColor, Colors.Hair, function(value)
        skin.Hair.ChestHairColor = value
        ApplyPlayerBodySkin(playerId, skin)
    end)
end

function CreateHairMenu(createCharacterMenu, playerId, skin)
    local hairMenu = MenuV:InheritMenu(createCharacterMenu, {subtitle = "Kiểu Tóc & Râu"})

    hairMenu:On("open", function()
        if skin.Model.Hash == GetHashKey("mp_m_freemode_01") then
            CreateMaleHairItems(hairMenu, playerId, skin)
        else
            CreateFemaleHairItems(hairMenu, playerId, skin)
        end
    end)

    hairMenu:On("close", function()
        hairMenu:ClearItems()
    end)

    return hairMenu
end
