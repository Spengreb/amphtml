/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as CSS from './selector.css';
import * as Preact from '../../../src/preact';
import {useContext, useMemo, useState} from '../../../src/preact';

const SelectorContext = Preact.createContext({});

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Selector(props) {
  const {
    'as': Comp = 'div',
    'children': children,
    'disabled': disabled,
    'value': value,
    'multiple': multiple,
    'onChange': onChange,
    'role': role = 'listbox',
    ...rest
  } = props;
  const [selectedState, setSelectedState] = useState(value ? value : []);
  // TBD: controlled values require override of properties.
  const selected = /** @type {!Array} */ (value ? value : selectedState);
  const context = useMemo(
    () => ({
      selected,
      selectOption: (option) => {
        if (!option) {
          return;
        }
        let newValue = null;
        if (multiple) {
          newValue = selected.includes(option)
            ? selected.filter((v) => v != option)
            : selected.concat(option);
        } else if (!selected.includes(option)) {
          newValue = [option];
        }
        if (newValue) {
          setSelectedState(newValue);
          if (onChange) {
            onChange({value: newValue, option});
          }
        }
      },
      disabled,
      multiple,
    }),
    [selected, disabled, multiple, onChange]
  );

  return (
    <Comp
      {...rest}
      role={role}
      aria-disabled={disabled}
      aria-multiselectable={multiple}
      disabled={disabled}
      multiple={multiple}
    >
      <SelectorContext.Provider value={context}>
        {children}
      </SelectorContext.Provider>
    </Comp>
  );
}

/**
 * @param {!JsonObject} props
 * @return {PreactDef.Renderable}
 */
export function Option(props) {
  const {
    'as': Comp = 'div',
    'disabled': disabled,
    'onClick': onClick,
    'option': option,
    'role': role = 'option',
    'style': style,
  } = props;
  const selectorContext = useContext(SelectorContext);
  const {
    'selected': selected,
    'selectOption': selectOption,
    'disabled': selectorDisabled,
    'multiple': selectorMultiple,
  } = selectorContext;
  const clickHandler = () => {
    if (selectorDisabled || disabled) {
      return;
    }
    if (onClick) {
      onClick();
    }
    selectOption(option);
  };
  const isSelected = /** @type {!Array} */ (selected).includes(option);
  const statusStyle =
    disabled || selectorDisabled
      ? CSS.DISABLED
      : isSelected
      ? selectorMultiple
        ? CSS.MULTI_SELECTED
        : CSS.SELECTED
      : CSS.OPTION;
  const optionProps = {
    ...props,
    'aria-disabled': disabled,
    onClick: clickHandler,
    option,
    role,
    selected: isSelected,
    style: {...statusStyle, ...style},
  };
  return <Comp {...optionProps}></Comp>;
}
