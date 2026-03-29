import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

const stepLabels = ['Details', 'Capture', 'Analysis', 'Verify', 'Cost'];

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressIndicator({ currentStep, totalSteps = 5 }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <React.Fragment key={step}>
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Check color="white" size={14} />
                  ) : (
                    <Text style={[styles.stepNum, (isCompleted || isCurrent) && styles.stepNumActive]}>
                      {step}
                    </Text>
                  )}
                </View>
                <Text style={[styles.label, isCurrent && styles.labelActive]}>
                  {stepLabels[i]}
                </Text>
              </View>
              {step < totalSteps && (
                <View style={[styles.line, isCompleted && styles.lineCompleted]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepWrapper: {
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: '#16A34A',
  },
  circleCurrent: {
    backgroundColor: '#1E3A8A',
  },
  stepNum: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  stepNumActive: {
    color: 'white',
  },
  label: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 4,
  },
  labelActive: {
    color: '#1E3A8A',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 15,
    marginHorizontal: 4,
  },
  lineCompleted: {
    backgroundColor: '#16A34A',
  },
});
