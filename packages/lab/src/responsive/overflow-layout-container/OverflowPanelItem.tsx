/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  KeyboardEvent,
} from "react";
import classnames from "classnames";
import { Button } from "@brandname/core";
import { FormField, FormFieldProps } from "../../form-field";
import { Tooltip } from "../../tooltip";

import { extractResponsiveProps, isResponsiveAttribute } from "../..";
import { OverflowPanelItemProps } from "./OverflowPaneltemProps";

function useControlledTooltip(
  predicate: () => boolean,
  isNavigatingWithKeyboard: boolean,
  tooltipEnterDelay = 0,
  tooltipLeaveDelay = 0
) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const tooltipKeyboardTimer = useRef<number | undefined>(undefined);
  const tooltipMouseHoverTimer = useRef<number | undefined>(undefined);
  const tooltipMouseLeaveTimer = useRef<number | undefined>(undefined);
  const clearTimeouts = () => {
    clearTimeout(tooltipKeyboardTimer.current);
    clearTimeout(tooltipMouseHoverTimer.current);
    clearTimeout(tooltipMouseLeaveTimer.current);
  };
  useEffect(() => () => clearTimeouts(), []);

  if (isNavigatingWithKeyboard) {
    if (predicate()) {
      clearTimeouts();
      if (tooltipEnterDelay) {
        tooltipKeyboardTimer.current = window.setTimeout(() => {
          setTooltipOpen(true);
        }, tooltipEnterDelay);
      } else {
        setTooltipOpen(true);
      }
    } else {
      clearTimeouts();
      if (tooltipOpen) {
        setTooltipOpen(false);
      }
    }
  }

  const onMouseOver = useCallback(() => {
    clearTimeouts();
    if (tooltipEnterDelay) {
      tooltipMouseHoverTimer.current = window.setTimeout(() => {
        setTooltipOpen(true);
      }, tooltipEnterDelay);
    } else {
      setTooltipOpen(true);
    }
  }, [tooltipEnterDelay]);

  const onMouseLeave = useCallback(() => {
    clearTimeouts();
    if (tooltipLeaveDelay) {
      tooltipMouseLeaveTimer.current = window.setTimeout(() => {
        setTooltipOpen(false);
      }, tooltipLeaveDelay);
    } else {
      setTooltipOpen(false);
    }
  }, [tooltipLeaveDelay]);

  return {
    open: tooltipOpen,
    onMouseOver,
    onMouseLeave,
  };
}

const renderToolbarField = (
  tool: React.ReactElement,
  toolbarItemProps: any,
  tooltrayFieldProps: Partial<FormFieldProps>
) => {
  const { children, ...fieldProps } = tool.props;
  const { fieldItemProps, ...itemProps } = toolbarItemProps;
  const [toolbarProps, props] = Object.keys(fieldProps).some(
    isResponsiveAttribute
  )
    ? extractResponsiveProps(tool.props)
    : [{}, tool.props];

  const visibleChild =
    children && children.length === 2 ? children[1] : children;

  const buttonProps = fieldItemProps;

  console.log({
    fieldProps,
    toolbarProps,
    tooltrayFieldProps,
    buttonProps,
    itemProps,
  });

  switch (tool.type) {
    case FormField:
      console.log(`DefaultPanelItemRenderer render a FormField`);
      return (
        <FormField
          tabIndex={-1}
          {...fieldProps}
          {...toolbarProps}
          {...tooltrayFieldProps}
          fullWidth={false}
        >
          {React.cloneElement(visibleChild, {
            ...itemProps,
            ...buttonProps,
            ...visibleChild.props,
          })}
        </FormField>
      );
    default:
      console.log(`DefaultPanelItemRenderer render the default case`);
      const isButton = tool.type === Button;
      return (
        <FormField
          tabIndex={-1}
          {...toolbarProps}
          {...tooltrayFieldProps}
          fullWidth={false}
          ActivationIndicatorComponent={() => null}
          className={isButton ? "uitkToolbarButton" : undefined}
        >
          {React.cloneElement(tool, { ...itemProps, ...buttonProps, ...props })}
        </FormField>
      );
  }
};

const OverflowPanelItem: React.FC<OverflowPanelItemProps> = (props) => {
  const {
    sourceItem,
    onKeyDown,
    blurSelected,
    hasToolTip,
    tooltipEnterDelay,
    tooltipLeaveDelay,
    isNavigatingWithKeyboard = false,
    closeMenu,
    isInteracted = false,
  } = props;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { disabled } = sourceItem.props;
  const { open, ...tooltipMouseListeners } = useControlledTooltip(
    () => isInteracted,
    isNavigatingWithKeyboard,
    tooltipEnterDelay,
    tooltipLeaveDelay
  );

  const handleOnClick = () => {
    if (sourceItem.props["data-close-on-click"] !== false) closeMenu?.();
  };

  const handleOnKeyDown = (evt: KeyboardEvent<HTMLElement>) => {
    onKeyDown && onKeyDown(evt, sourceItem.props["data-close-on-click"]);
  };

  const interactionClasses = isNavigatingWithKeyboard
    ? {
        "uitkOverflowPanel-menuItemKeyboardActive":
          !disabled && isInteracted && !blurSelected,
        "uitkOverflowPanel-menuItemKeyboardDisabled": disabled && isInteracted,
      }
    : {
        "uitkOverflowPanel-menuItemHover": !disabled && !blurSelected,
      };

  const content = (contentProps: any = {}) => {
    const toolbarButtonProps = {
      className: classnames({
        "uitkOverflowPanel-menuItemBlurSelected": blurSelected,
        "uitkOverflowPanel-menuItemSelected": !disabled && isInteracted,
        ...interactionClasses,
      }),
    };
    const fieldItemProps = {
      className: classnames("uitkOverflowPanel-fieldMenuItem"),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const toolbarItemProps = {
      ...toolbarButtonProps,
      ...fieldItemProps,
      ...contentProps,
    };
    const tooltrayFieldProps = {
      onClick: handleOnClick,
      onKeyDown: handleOnKeyDown,
    };
    return renderToolbarField(sourceItem, toolbarItemProps, tooltrayFieldProps);
  };

  return hasToolTip ? (
    <Tooltip
      disableFocusListener
      disableHoverListener
      enterDelay={tooltipEnterDelay}
      leaveDelay={tooltipLeaveDelay}
      open={open}
      placement="top"
      // title={sourceItem.tooltip}
    >
      {content(tooltipMouseListeners)}
    </Tooltip>
  ) : (
    content()
  );
};

export default OverflowPanelItem;