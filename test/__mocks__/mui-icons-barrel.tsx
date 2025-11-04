import React from 'react'

const Stub: React.FC<any> = (props) => {
  const testId = props?.['data-testid'] ?? 'mui-icon'
  const { ['data-testid']: _omit, ...rest } = props || {}
  return <span data-testid={testId} {...rest} />
}

export default Stub

export const Lock = Stub
export const Visibility = Stub
export const VisibilityOff = Stub
export const Person = Stub
export const PersonOutline = Stub
export const PersonOutlined = Stub
export const AccountCircle = Stub
export const Settings = Stub
export const SettingsInputComponentRounded = Stub
export const FilterList = Stub
export const FilterListOff = Stub
export const FitScreen = Stub
export const Fullscreen = Stub
export const FullscreenExit = Stub
export const ZoomIn = Stub
export const ZoomOut = Stub
