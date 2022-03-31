import { Tooltip, TooltipProps } from "../../tooltip";
import React, { forwardRef } from "react";
import { FavoriteToggle, FavoriteToggleProps } from "./FavoriteToggle";

export interface FavoriteToggleWithTooltipProps extends FavoriteToggleProps {
  tooltipProps?: TooltipProps;
  tooltipTitle?: string;
}

export const FavoriteToggleWithTooltip = forwardRef<
  HTMLSpanElement,
  FavoriteToggleWithTooltipProps
>(function FavoriteToggleWithTooltip(props, ref) {
  const {
    tooltipTitle = "Toggle favorite",
    tooltipProps,
    ...restProps
  } = props;

  return (
    <Tooltip
      enterDelay={1500}
      placement="bottom"
      title={tooltipTitle}
      {...tooltipProps}
    >
      <FavoriteToggle {...restProps} ref={ref} />
    </Tooltip>
  );
});