# SweetAlert2 Migration Guide

## ✅ Completed
- Added SweetAlert2 library to index.html
- Created global utility functions for alerts
- Migrated phiKeyMap.js
- Migrated monthlySchedule.js
- Migrated monthlyScheduleList.js
- Migrated monthlyScheduleModule.js

## Available Functions

### `showAlert(message, type, title)`
General alert with customizable icon type
```javascript
showAlert("මෙය පණිවිඩයකි", "info", "තොරතුරු");
```

### `showSuccess(message, title)`
Success message with auto-close
```javascript
showSuccess("සාර්ථකව සුරකින ලදී");
```

### `showError(message, title)`
Error message
```javascript
showError("දෝෂයකි");
```

### `showWarning(message, title)`
Warning message
```javascript
showWarning("අවවාදයයි");
```

### `showConfirm(message, title)`
Confirmation dialog (returns Promise<boolean>)
```javascript
if (await showConfirm("මකා දමන්නද?")) {
  // User confirmed
}
```

## 📝 Files To Update

Replace `alert()` calls with appropriate `showAlert()`, `showSuccess()`, `showError()`, or `showWarning()`
Replace `confirm()` calls with `await showConfirm()` (make function async)

### Register Files
- ✅ js/registers/sanitation.js
- ✅ js/registers/infectious.js  
- ✅ js/registers/schoolImmunization.js
- ✅ js/registers/tradeIndustries.js
- ✅ js/registers/nonCommunicable.js
- ✅ js/registers/meatInspection.js
- ✅ js/registers/latrineConstruction.js
- ✅ js/registers/inwardRegister.js
- ✅ js/registers/healthEducation.js
- ✅ js/registers/occupationalSafety.js
- ✅ js/registers/notices.js

## Migration Pattern

### Before (old):
```javascript
if (!value) return alert("Enter value");
if (confirm("Delete?")) {
  deleteItem();
}
alert("Saved!");
```

### After (new):
```javascript
if (!value) return showError("Enter value");
if (await showConfirm("Delete?")) {
  deleteItem();
}
showSuccess("Saved!");
```

## Notes
- All confirm() calls require function to be async
- Success messages auto-close after 2 seconds
- Sinhala/Tamil/English text supported
- Custom styling applied via CSS in index.html
