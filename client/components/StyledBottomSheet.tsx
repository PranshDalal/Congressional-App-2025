import React, { forwardRef, useCallback } from "react";
import { StyleSheet } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet"; // Fix import
import theme from "@/styles/theme";

type StyledBottomSheetProps = {
  children: React.ReactNode;
  snapPoints?: string[];
  onSheetChange?: (index: number) => void;
  enablePanDownToClose?: boolean;
  enableDynamicSizing?: boolean;
};

const StyledBottomSheet = forwardRef<
  BottomSheetModal, // Change this from BottomSheetMethods
  StyledBottomSheetProps
>(
  (
    {
      children,
      snapPoints = ["25%", "50%", "90%"],
      onSheetChange,
      enablePanDownToClose = true,
      enableDynamicSizing = true,
    },
    ref
  ) => {
    const handleSheetChanges = useCallback(
      (index: number) => {
        // console.log("handleSheetChanges", index);
        onSheetChange?.(index);
      },
      [onSheetChange]
    );

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChanges}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        enableDynamicSizing={enableDynamicSizing}
        backgroundStyle={styles.background}
        handleStyle={styles.handleBackground}
        handleIndicatorStyle={styles.handleIndicator}
        bottomInset={0}
      >
        <BottomSheetView style={styles.contentContainer}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

StyledBottomSheet.displayName = "StyledBottomSheet";

export default StyledBottomSheet;

const styles = StyleSheet.create({
  background: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    // borderColor: theme.colors.border,
    // borderWidth: 1
  },
  handleIndicator: {
    backgroundColor: theme.colors.border,
    width: 36
  },
  handleBackground: {
    // backgroundColor: theme.colors.textMuted,
    // borderTopLeftRadius: theme.radii.xl,
    // borderTopRightRadius: theme.radii.xl,
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    alignItems: "center",
    // backgroundColor: theme.colors.bg,
  },
});
