# Medical Accuracy in Health Scoring

## Overview

The LiverBuddy app now uses a medically accurate health scoring system based on peer-reviewed research and medical guidelines for alcohol metabolism and liver health.

## Key Medical Facts Incorporated

### Alcohol Processing Rate
- **Base Rate**: Average person processes 10g of pure alcohol per hour (1 standard drink)
- **Individual Factors**:
  - **Gender**: Males process ~15% faster than females
  - **Weight**: +0.1g/hour per kg above baseline (70kg for males, 60kg for females)
  - **Age**: 1% decrease per year after age 30 (capped at 20% reduction)
  - **Fitness**: Can improve metabolism by 5-10%

### Blood Alcohol Content (BAC) Estimation
- Uses Widmark formula: `BAC = (grams alcohol / (body weight * r)) * 100`
- Body water percentages: 68% for males, 55% for females
- Accounts for alcohol processing over time

### Medical Risk Thresholds
Based on medical literature and guidelines:
- **Very Low Risk**: <3 units/day, <14 units/week
- **Low Risk**: 3-6 units/day, 14-21 units/week  
- **Moderate Risk**: 6-8 units/day, 21-35 units/week, 1+ binge days
- **High Risk**: 8-10 units/day, 35-50 units/week, 2+ binge days with consecutive drinking
- **Very High Risk**: 10+ units/day, 50+ units/week, 3+ binge days

## Health Score Calculation

### Base Score (Risk Assessment)
- Very Low Risk: 95 points
- Low Risk: 80 points
- Moderate Risk: 60 points
- High Risk: 35 points
- Very High Risk: 15 points

### Additional Factors

#### Penalties:
1. **Rapid Consumption**: -10 to -15 points for drinking too quickly
2. **Peak BAC**: Up to -20 points for dangerous BAC levels (>0.15%)
3. **Insufficient Recovery**: Up to -15 points for not allowing liver recovery time
4. **Consecutive Days**: -8 to -15 points for continuous drinking

#### Bonuses:
1. **Responsible Patterns**: +5 points for moderate, spaced drinking

### Recovery Time Calculation
- **Base**: Time to process all alcohol
- **Additional Recovery**: 
  - 2+ units: +2 hours
  - 4+ units: +6 hours  
  - 6+ units: +12 hours
  - 8+ units: +16 hours
  - 10+ units: +24 hours

## Default User Profile
For accurate calculations, the system assumes:
- **Age**: 25 years old
- **Weight**: 75kg
- **Gender**: Male
- **Fitness**: Good shape

This will be configurable through user onboarding in future versions.

## Medical Sources
- Liver metabolism research from medical journals
- WHO and medical authority guidelines
- Peer-reviewed studies on alcohol processing rates
- Clinical data on liver recovery times

## Future Enhancements
1. User profile onboarding for personalized calculations
2. Integration with health data (weight, age updates)
3. More sophisticated liver stress modeling
4. Machine learning for pattern recognition 