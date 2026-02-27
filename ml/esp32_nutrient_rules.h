#pragma once

struct NutrientStatus {
  bool low_nitrogen;
  bool low_phosphorus;
  bool low_potassium;
  bool high_nitrogen;
  bool high_phosphorus;
  bool high_potassium;
};

inline NutrientStatus checkNutrients(float nitrogen, float phosphorus, float potassium) {
  NutrientStatus s;

  s.low_nitrogen = nitrogen < 40.0f;
  s.high_nitrogen = nitrogen > 120.0f;

  s.low_phosphorus = phosphorus < 10.0f;
  s.high_phosphorus = phosphorus > 40.0f;

  s.low_potassium = potassium < 50.0f;
  s.high_potassium = potassium > 200.0f;

  return s;
}
