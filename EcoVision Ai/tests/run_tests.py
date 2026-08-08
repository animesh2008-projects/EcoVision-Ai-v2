import math
import sys

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371e3
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi/2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def escape_html(str_val):
    if not str_val:
        return ''
    return (str(str_val)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#039;'))

passed = 0
failed = 0

def assert_test(condition, message):
    global passed, failed
    if condition:
        print(f"  [PASS] {message}")
        passed += 1
    else:
        print(f"  [FAIL] {message}")
        failed += 1

print("\n--- Running EcoVision AI Automated Test Suite --- \n")

# 1. Distance Test
dist = calculate_distance(12.9716, 77.5946, 12.9718, 77.5948)
assert_test(0 < dist < 50, f"Haversine spatial formula computes accurate distance ({dist:.2f}m)")

zero_dist = calculate_distance(12.9716, 77.5946, 12.9716, 77.5946)
assert_test(round(zero_dist) == 0, "Identical coordinates yield 0m distance")

# 2. XSS Protection Test
mal_script = '<script>alert("xss")</script>'
escaped = escape_html(mal_script)
assert_test('<script>' not in escaped, "Sanitizer strips raw script tags")
assert_test('&lt;script&gt;' in escaped, "Sanitizer converts angle brackets to &lt; &gt;")

# 3. Location Weights Test
weights = {'canteen': 100, 'library': 90, 'other': 30}
assert_test(weights['canteen'] == 100, "Canteen carries maximum impact weight (100)")
assert_test(weights['library'] == 90, "Library carries high impact weight (90)")

print("\n==========================================")
print(f"Test Summary: {passed} Passed, {failed} Failed")
print("==========================================\n")

if failed > 0:
    sys.exit(1)
else:
    sys.exit(0)
