import Trigger from '../../vc-trigger';
import { computed, defineComponent, onBeforeUnmount, PropType, ref, watch } from 'vue';
import { MenuMode } from './interface';
import { useInjectMenu } from './hooks/useMenuContext';
import { placements, placementsRtl } from './placements';
import raf from '../../_util/raf';
import classNames from '../../_util/classNames';

const popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop',
};
export default defineComponent({
  name: 'PopupTrigger',
  props: {
    prefixCls: String,
    mode: String as PropType<MenuMode>,
    visible: Boolean,
    // popup: React.ReactNode;
    popupClassName: String,
    popupOffset: Array as PropType<number[]>,
    disabled: Boolean,
    onVisibleChange: Function as PropType<(visible: boolean) => void>,
  },
  slots: ['popup'],
  emits: ['visibleChange'],
  inheritAttrs: false,
  setup(props, { slots, emit }) {
    const innerVisible = ref(false);
    const {
      getPopupContainer,
      rtl,
      subMenuOpenDelay,
      subMenuCloseDelay,
      builtinPlacements,
      triggerSubMenuAction,
    } = useInjectMenu();

    const placement = computed(() =>
      rtl
        ? { ...placementsRtl, ...builtinPlacements.value }
        : { ...placements, ...builtinPlacements.value },
    );

    const popupPlacement = computed(() => popupPlacementMap[props.mode]);

    const visibleRef = ref<number>();
    watch(
      () => props.visible,
      visible => {
        raf.cancel(visibleRef.value);
        visibleRef.value = raf(() => {
          innerVisible.value = visible;
        });
      },
      { immediate: true },
    );
    onBeforeUnmount(() => {
      raf.cancel(visibleRef.value);
    });

    const onVisibleChange = (visible: boolean) => {
      emit('visibleChange', visible);
    };
    return () => {
      const { prefixCls, popupClassName, mode, popupOffset, disabled } = props;
      return (
        <Trigger
          prefixCls={prefixCls}
          popupClassName={classNames(
            `${prefixCls}-popup`,
            {
              [`${prefixCls}-rtl`]: rtl,
            },
            popupClassName,
          )}
          stretch={mode === 'horizontal' ? 'minWidth' : null}
          getPopupContainer={getPopupContainer.value}
          builtinPlacements={placement.value}
          popupPlacement={popupPlacement.value}
          popupVisible={innerVisible.value}
          popupAlign={popupOffset && { offset: popupOffset }}
          action={disabled ? [] : [triggerSubMenuAction.value]}
          mouseEnterDelay={subMenuOpenDelay.value}
          mouseLeaveDelay={subMenuCloseDelay.value}
          onPopupVisibleChange={onVisibleChange}
          // forceRender={forceSubMenuRender}
          // popupMotion={mergedMotion}
          v-slots={{ popup: slots.popup, default: slots.default }}
        ></Trigger>
      );
    };
  },
});