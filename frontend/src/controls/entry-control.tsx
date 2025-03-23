import { StateCategoryEntry } from '@remote-mixer/types'

import { sendApiMessage } from '../api/api-wrapper'
import { useDeviceCategory, useDeviceConfiguration, useEntryState } from '../api/state'
import { useMeter } from '../hooks/meter'
import { Button } from '../ui/buttons/button'
import { Entry } from '../ui/containers/entry'
import { Fader } from '../ui/controls/fader/fader'
import { iconDetails } from '../ui/icons'
import { Icon } from '../ui/icons/icon'


import {
  value_to_db,
  db_to_value,
  db_to_string,
} from '../util/volume-converter'

import { showEntryDialog } from './entry-dialog/entry-dialog'

export interface EntryControlProps {
  category: string
  id: string
  property?: string
}

export function EntryControl({
  category,
  id,
  property = 'value',
}: EntryControlProps) {
  const state = useEntryState(category, id) ?? ({} as StateCategoryEntry)
  const categoryInfo = useDeviceCategory(category)

  const configuration = useDeviceConfiguration()
  const colors = configuration.colors

  function change(changedProperty: string, value: any) {
    sendApiMessage({
      type: 'change',
      category,
      id,
      property: changedProperty,
      value,
    })
  }

  function selectColor(stateColor: string | undefined, configColor: string) {
    if (stateColor) {
      return stateColor;
    }
    if (configColor != "") {
      return configColor
    }
    return undefined
  }

  const meterRef = useMeter(categoryInfo, id)

  return (
    <Entry inactive={!state.on}>
      <Button onDown={() => change('on', !state.on)} active={state.on}>
        {state.on ? 'ON' : 'OFF'}
      </Button>
      <Fader
        value={state[property] ?? 0}
        onChange={value => change(property, value)}
        max={255}
        step={1}
        label={(categoryInfo.namePrefix ?? '') + id}
        subLabel={state.name}
        color={selectColor(state.color, colors[id])}
        meterRef={meterRef}
      />
      <Button
        onDown={() => change(property, db_to_value(0))}
        active={(value_to_db(state[property] ?? 0) ?? 0) === 0}
      >
        {db_to_string(value_to_db(state[property] ?? 0) ?? 0, 5)}
      </Button>
      {/*<Icon
        icon={iconDetails}
        hoverable
        padding
        onClick={() => showEntryDialog({ category, id })}
      />*/}
    </Entry>
  )
}
