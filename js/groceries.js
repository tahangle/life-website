/**
 * GROCERIES & MEAL PLANNING LOGIC
 *
 * Profile:
 * - €170/month ticket restaurant, €25/day max, ~20 work days
 * - Work 4-5 days/week (lunches covered by ticket resto)
 * - Gym 3x/week (high protein needed)
 * - Tiny freezer (max 2-3 portions)
 * - Air fryer main tool
 * - Goal: maintain weight, healthy habits, avoid sugar cravings
 */

// ============================================
// DATA - Will be loaded from JSON files
// ============================================

let meals = [];
let ingredients = [];

// Work schedule (imported from calendar)
const workSchedule = {
    // MAY 2026
    '2026-05-04': { type: 'closing', time: '11h40-19h40' },
    '2026-05-06': { type: 'closing', time: '11h40-19h40' },
    '2026-05-07': { type: 'closing', time: '11h40-19h40' },
    '2026-05-08': { type: 'closing', time: '11h40-19h40' },
    '2026-05-09': { type: 'opening', time: '10h20-18h20' },
    '2026-05-10': { type: 'custom', time: '11h00-19h00' },
    '2026-05-11': { type: 'opening', time: '10h20-18h20' },
    '2026-05-12': { type: 'opening', time: '10h20-18h20' },
    '2026-05-14': { type: 'closing', time: '11h40-19h40' },
    '2026-05-15': { type: 'closing', time: '11h40-19h40' },
    '2026-05-16': { type: 'opening', time: '10h20-18h20' },
    '2026-05-17': { type: 'custom', time: '11h00-19h00' },
    '2026-05-18': { type: 'opening', time: '10h20-18h20' },
    '2026-05-19': { type: 'closing', time: '11h40-19h40' },
    '2026-05-20': { type: 'closing', time: '11h40-19h40' },
    '2026-05-21': { type: 'opening', time: '10h20-18h20' },
    '2026-05-22': { type: 'opening', time: '10h20-18h20' },
    '2026-05-23': { type: 'opening', time: '10h20-18h20' },
    '2026-05-24': { type: 'custom', time: '11h00-19h00' },
    '2026-05-25': { type: 'opening', time: '10h20-18h20' },
    '2026-05-26': { type: 'opening', time: '10h20-18h20' },
    '2026-05-28': { type: 'opening', time: '10h20-18h20' },
    '2026-05-29': { type: 'closing', time: '11h40-19h40' },
    '2026-05-30': { type: 'closing', time: '11h40-19h40' },
    '2026-05-31': { type: 'custom', time: '11h00-19h00' },
    // JUNE 2026
    '2026-06-01': { type: 'closing', time: '11h40-19h40' },
    '2026-06-03': { type: 'custom', time: '10h20-19h20' },
    '2026-06-04': { type: 'closing', time: '11h40-19h40' },
    '2026-06-05': { type: 'opening', time: '10h20-18h20' },
    '2026-06-06': { type: 'closing', time: '11h40-19h40' },
    '2026-06-08': { type: 'opening', time: '10h20-18h20' },
    '2026-06-09': { type: 'opening', time: '10h20-18h20' },
    '2026-06-10': { type: 'closing', time: '11h40-19h40' },
    '2026-06-11': { type: 'opening', time: '10h20-18h20' },
    '2026-06-12': { type: 'opening', time: '10h20-18h20' },
    '2026-06-14': { type: 'closing', time: '11h40-19h40' },
    '2026-06-15': { type: 'closing', time: '11h40-19h40' },
    '2026-06-16': { type: 'opening', time: '10h20-18h20' },
    '2026-06-17': { type: 'opening', time: '10h20-18h20' },
    '2026-06-19': { type: 'closing', time: '11h40-19h40' },
    '2026-06-20': { type: 'opening', time: '10h20-18h20' },
    '2026-06-21': { type: 'custom', time: '11h00-19h00' },
    '2026-06-22': { type: 'opening', time: '10h20-18h20' },
    '2026-06-24': { type: 'closing', time: '11h40-19h40' },
    '2026-06-25': { type: 'closing', time: '11h40-19h40' },
    '2026-06-29': { type: 'closing', time: '11h40-19h40' },
    '2026-06-30': { type: 'closing', time: '11h40-19h40' }
};

// Gym schedule (loaded from localStorage, synced with calendar)
let gymSchedule = {};

// ============================================
// CONSTANTS
// ============================================

const TICKET_RESTO_MONTHLY = 170;
const TICKET_RESTO_DAILY_MAX = 25;
const MAX_FRIDGE_PORTIONS = 2;
const NO_REPEAT_DAYS = 4;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

function getShortDayName(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

// ============================================
// 1. WEEK BUILDER
// ============================================

/**
 * Build a week structure with all relevant info for each day
 * @param {Date} startDate - Monday of the week to build
 * @returns {Array} - Array of 7 day objects
 */
function buildWeek(startDate) {
    const week = [];

    // Load gym schedule from localStorage
    const calendarEvents = JSON.parse(localStorage.getItem('calendarEvents') || '{}');

    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const key = getDateKey(date);

        const workShift = workSchedule[key] || null;
        const gymSession = calendarEvents[key]?.gym || null;

        const day = {
            date: date,
            key: key,
            dayName: getDayName(date),
            shortName: getShortDayName(date),
            dayIndex: i,

            // Work info
            isWorkDay: !!workShift,
            shiftType: workShift?.type || null,
            isClosingShift: workShift?.type === 'closing',
            isTiredDay: workShift?.type === 'closing', // Closing shifts = tired

            // Gym info
            isGymDay: !!gymSession,
            gymType: gymSession,
            needsHighProtein: !!gymSession,

            // Rest day = not working
            isRestDay: !workShift,

            // Meal planning (to be filled)
            dinner: null,
            isLeftoverDay: false,
            isBatchCookDay: false
        };

        week.push(day);
    }

    // Identify batch cook day: Sunday or last rest day before a work run
    identifyBatchCookDay(week);

    return week;
}

/**
 * Find the best day for batch cooking
 * Priority: Sunday > last rest day before multiple work days
 */
function identifyBatchCookDay(week) {
    // First, try Sunday (index 0 if week starts Monday, or 6 if starts Sunday)
    const sunday = week.find(d => d.dayName === 'Sunday');

    if (sunday && sunday.isRestDay) {
        sunday.isBatchCookDay = true;
        return;
    }

    // Otherwise, find rest days that precede work days
    for (let i = 0; i < week.length; i++) {
        const day = week[i];
        const nextDay = week[i + 1];

        if (day.isRestDay && nextDay && nextDay.isWorkDay) {
            // Count upcoming work days
            let workStreak = 0;
            for (let j = i + 1; j < week.length; j++) {
                if (week[j].isWorkDay) workStreak++;
                else break;
            }

            // If 2+ work days ahead, this is a good batch cook day
            if (workStreak >= 2) {
                day.isBatchCookDay = true;
                return;
            }
        }
    }

    // Fallback: first rest day
    const firstRestDay = week.find(d => d.isRestDay);
    if (firstRestDay) {
        firstRestDay.isBatchCookDay = true;
    }
}

// ============================================
// 2. MEAL ASSIGNER
// ============================================

/**
 * Assign dinners to each day of the week
 * Rules:
 * - Gym days: only high protein meals
 * - Batch cook day: assign batchFriendly meal, mark next day as leftover
 * - Tired days (closing): quick meals (prepTime < 15)
 * - No repeat within 4 days
 * - Max 2 portions in fridge
 */
function assignMeals(week, recentMeals = []) {
    const assignedMealIds = [...recentMeals]; // Track recent meals for no-repeat rule
    let fridgePortions = 0;

    for (let i = 0; i < week.length; i++) {
        const day = week[i];

        // Skip if already assigned (leftover day)
        if (day.isLeftoverDay || day.dinner) continue;

        // Get valid meals for this day
        const validMeals = getValidMeals(day, assignedMealIds, fridgePortions);

        if (validMeals.length === 0) {
            // Fallback: any meal that fits basic criteria
            day.dinner = {
                meal: meals.find(m => day.needsHighProtein ? m.protein === 'high' : true) || meals[0],
                isLeftover: false
            };
            continue;
        }

        // Select best meal
        const selectedMeal = selectBestMeal(day, validMeals);

        day.dinner = {
            meal: selectedMeal,
            isLeftover: false
        };

        assignedMealIds.push(selectedMeal.id);

        // Handle batch cooking
        if (day.isBatchCookDay && selectedMeal.batchFriendly && selectedMeal.portionsPerCook > 1) {
            // Mark next day as leftover
            const nextDay = week[i + 1];
            if (nextDay && !nextDay.dinner) {
                nextDay.dinner = {
                    meal: selectedMeal,
                    isLeftover: true
                };
                nextDay.isLeftoverDay = true;
            }
            fridgePortions += selectedMeal.portionsPerCook - 1;
        } else {
            fridgePortions = Math.max(0, fridgePortions - 1);
        }

        // Enforce max fridge portions
        fridgePortions = Math.min(fridgePortions, MAX_FRIDGE_PORTIONS);
    }

    return week;
}

/**
 * Get meals valid for a specific day
 */
function getValidMeals(day, recentMealIds, currentFridgePortions) {
    return meals.filter(meal => {
        // Rule: Gym days need high protein
        if (day.needsHighProtein && meal.protein !== 'high') {
            return false;
        }

        // Rule: Tired days need quick meals
        if (day.isTiredDay && meal.prepTime > 15) {
            return false;
        }

        // Rule: No repeat within 4 days
        const recentFour = recentMealIds.slice(-NO_REPEAT_DAYS);
        if (recentFour.includes(meal.id)) {
            return false;
        }

        // Rule: Batch cook day prefers batch-friendly meals
        if (day.isBatchCookDay && !meal.batchFriendly) {
            // Don't exclude, but will be ranked lower
        }

        // Rule: Check fridge capacity for batch meals
        if (meal.batchFriendly && meal.portionsPerCook > 1) {
            if (currentFridgePortions + (meal.portionsPerCook - 1) > MAX_FRIDGE_PORTIONS) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Select the best meal from valid options
 */
function selectBestMeal(day, validMeals) {
    // Score each meal
    const scored = validMeals.map(meal => {
        let score = 0;

        // Prefer batch-friendly on batch cook days
        if (day.isBatchCookDay && meal.batchFriendly) {
            score += 10;
        }

        // Prefer quick meals on tired days
        if (day.isTiredDay && meal.prepTime <= 10) {
            score += 5;
        }

        // Prefer high protein on gym days
        if (day.isGymDay && meal.protein === 'high') {
            score += 3;
        }

        // Prefer airfryer meals (main cooking tool)
        if (meal.tool === 'airfryer') {
            score += 2;
        }

        // Slight randomness to add variety
        score += Math.random() * 2;

        return { meal, score };
    });

    // Sort by score and return best
    scored.sort((a, b) => b.score - a.score);
    return scored[0].meal;
}

// ============================================
// 3. SHOPPING LIST GENERATOR
// ============================================

/**
 * Generate shopping list from week's meals
 * Split into 2 trips: Sunday (proteins + batch) and Wednesday (fresh)
 */
function generateShoppingList(week) {
    // Collect all ingredients needed
    const ingredientNeeds = {};

    week.forEach(day => {
        if (!day.dinner || day.isLeftoverDay) return;

        const meal = day.dinner.meal;
        meal.ingredients.forEach(ing => {
            if (!ingredientNeeds[ing]) {
                ingredientNeeds[ing] = {
                    name: ing,
                    count: 0,
                    neededByDay: []
                };
            }
            ingredientNeeds[ing].count++;
            ingredientNeeds[ing].neededByDay.push(day.key);
        });
    });

    // Get ingredient details and categorize
    const shoppingList = Object.values(ingredientNeeds).map(need => {
        const ingredientData = ingredients.find(i => i.name === need.name) || {
            name: need.name,
            category: 'other',
            fridgeDays: 7,
            avgCost: 2.00,
            unit: 'each'
        };

        return {
            ...need,
            ...ingredientData
        };
    });

    // Split into two trips
    const trip1 = []; // Sunday: proteins, batch cook ingredients, longer-lasting items
    const trip2 = []; // Wednesday: fresh produce, restocks

    shoppingList.forEach(item => {
        // Proteins and batch cook items go in Trip 1
        if (item.category === 'protein' || item.category === 'carb' || item.category === 'pantry') {
            trip1.push(item);
        }
        // Fresh items with short fridge life go in Trip 2
        else if (item.fridgeDays <= 4) {
            trip2.push(item);
        }
        // Default to Trip 1
        else {
            trip1.push(item);
        }
    });

    // Calculate costs
    const trip1Cost = trip1.reduce((sum, item) => sum + item.avgCost, 0);
    const trip2Cost = trip2.reduce((sum, item) => sum + item.avgCost, 0);
    const totalCost = trip1Cost + trip2Cost;

    return {
        trip1: {
            name: 'Sunday Shopping',
            items: trip1,
            estimatedCost: trip1Cost
        },
        trip2: {
            name: 'Wednesday Restock',
            items: trip2,
            estimatedCost: trip2Cost
        },
        totalCost,
        allItems: shoppingList
    };
}

// ============================================
// 4. BUDGET TRACKER
// ============================================

/**
 * Track ticket restaurant spending
 */
function getBudgetStatus() {
    const state = JSON.parse(localStorage.getItem('groceryBudgetState') || '{}');

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Reset if new month
    if (state.month !== currentMonth || state.year !== currentYear) {
        state.month = currentMonth;
        state.year = currentYear;
        state.spent = 0;
        state.trips = [];
        localStorage.setItem('groceryBudgetState', JSON.stringify(state));
    }

    const remaining = TICKET_RESTO_MONTHLY - (state.spent || 0);
    const daysLeftInMonth = getDaysLeftInMonth();
    const tripsRemaining = Math.floor(remaining / TICKET_RESTO_DAILY_MAX);

    return {
        monthlyBudget: TICKET_RESTO_MONTHLY,
        dailyMax: TICKET_RESTO_DAILY_MAX,
        spent: state.spent || 0,
        remaining: remaining,
        tripsRemaining: tripsRemaining,
        daysLeftInMonth: daysLeftInMonth,
        averagePerDay: remaining / daysLeftInMonth
    };
}

function recordExpense(amount, description) {
    const state = JSON.parse(localStorage.getItem('groceryBudgetState') || '{}');
    state.spent = (state.spent || 0) + amount;
    state.trips = state.trips || [];
    state.trips.push({
        date: new Date().toISOString(),
        amount: amount,
        description: description
    });
    localStorage.setItem('groceryBudgetState', JSON.stringify(state));
    return getBudgetStatus();
}

function getDaysLeftInMonth() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate() + 1;
}

// ============================================
// 5. PERISHABLE WARNING
// ============================================

/**
 * Check for ingredients that might spoil before use
 * @param {Object} shoppingList - Generated shopping list
 * @param {Array} week - Week plan
 */
function checkPerishableWarnings(shoppingList, week) {
    const warnings = [];
    const sundayKey = week.find(d => d.dayName === 'Sunday')?.key;
    const wednesdayKey = week.find(d => d.dayName === 'Wednesday')?.key;

    shoppingList.allItems.forEach(item => {
        // Find when this ingredient is needed
        item.neededByDay.forEach(dayKey => {
            const day = week.find(d => d.key === dayKey);
            if (!day) return;

            // Calculate days from shopping to use
            let shoppingDay;
            if (shoppingList.trip1.items.includes(item)) {
                shoppingDay = new Date(sundayKey);
            } else {
                shoppingDay = new Date(wednesdayKey);
            }

            const useDay = new Date(dayKey);
            const daysBetween = Math.ceil((useDay - shoppingDay) / (1000 * 60 * 60 * 24));

            // Warning if ingredient will spoil
            if (daysBetween > item.fridgeDays) {
                warnings.push({
                    ingredient: item.name,
                    fridgeDays: item.fridgeDays,
                    neededIn: daysBetween,
                    day: day.dayName,
                    suggestion: item.freezable
                        ? `Freeze ${item.name} immediately after purchase`
                        : `Buy ${item.name} on Wednesday instead`
                });
            }
        });
    });

    return warnings;
}

// ============================================
// MAIN API
// ============================================

/**
 * Initialize the grocery system
 */
async function initGrocerySystem() {
    // Load data from JSON files
    try {
        const mealsResponse = await fetch('data/meals.json');
        meals = await mealsResponse.json();

        const ingredientsResponse = await fetch('data/ingredients.json');
        ingredients = await ingredientsResponse.json();
    } catch (error) {
        console.error('Error loading grocery data, using fallback:', error);
        // Fallback data for local file:// access
        meals = [
            { id: "moroccan_chicken", name: "Moroccan spiced chicken", protein: "high", carb: "medium", prepTime: 25, tool: "airfryer", batchFriendly: true, portionsPerCook: 2, fridgeDays: 3, freezable: false, cost: 5.50, ingredients: ["chicken breast", "small potatoes", "zucchini", "cumin", "paprika", "olive oil"] },
            { id: "jambon_pasta", name: "Integral pasta + crème jambon sec + zucchini", protein: "medium", carb: "high", prepTime: 20, tool: "pan", batchFriendly: false, portionsPerCook: 1, fridgeDays: 2, freezable: false, cost: 4.00, ingredients: ["integral pasta", "crème fraîche légère", "jambon sec", "zucchini", "garlic"] },
            { id: "scrambled_eggs_tomato", name: "Scrambled eggs + tomatoes + onion + edam", protein: "high", carb: "low", prepTime: 10, tool: "pan", batchFriendly: false, portionsPerCook: 1, fridgeDays: 1, freezable: false, cost: 2.50, ingredients: ["eggs", "tomatoes", "onion", "edam slices", "integral bread"] },
            { id: "fish_potatoes", name: "Air fryer fish + smashed potatoes + tomato sauce + spinach", protein: "high", carb: "medium", prepTime: 25, tool: "airfryer", batchFriendly: false, portionsPerCook: 1, fridgeDays: 2, freezable: true, cost: 5.00, ingredients: ["colin de alaska", "small potatoes", "canned tomatoes", "spinach", "garlic", "olive oil"] },
            { id: "chicken_bowl", name: "Chicken bowl + rice + mozzarella + tomato", protein: "high", carb: "medium", prepTime: 15, tool: "airfryer", batchFriendly: true, portionsPerCook: 2, fridgeDays: 3, freezable: false, cost: 5.00, ingredients: ["chicken breast", "integral rice", "mozzarella", "tomatoes", "olive oil", "garlic"] },
            { id: "eggs_poivron", name: "Scrambled eggs + poivron + jambon sec", protein: "high", carb: "low", prepTime: 10, tool: "pan", batchFriendly: false, portionsPerCook: 1, fridgeDays: 1, freezable: false, cost: 3.00, ingredients: ["eggs", "frozen poivron", "jambon sec", "rice cakes"] },
            { id: "lemon_chicken_rice", name: "Lemon herb chicken + rice + wilted spinach", protein: "high", carb: "medium", prepTime: 25, tool: "airfryer", batchFriendly: true, portionsPerCook: 2, fridgeDays: 3, freezable: false, cost: 5.00, ingredients: ["chicken breast", "integral rice", "spinach", "lemon", "garlic", "thyme", "olive oil"] }
        ];
        ingredients = [
            { name: "chicken breast", category: "protein", fridgeDays: 2, freezable: true, avgCost: 3.50, unit: "per 300g" },
            { name: "colin de alaska", category: "protein", fridgeDays: 2, freezable: true, avgCost: 3.00, unit: "per fillet" },
            { name: "eggs", category: "protein", fridgeDays: 21, freezable: false, avgCost: 0.30, unit: "per egg" },
            { name: "jambon sec", category: "protein", fridgeDays: 5, freezable: false, avgCost: 2.50, unit: "per pack" },
            { name: "integral pasta", category: "carb", fridgeDays: 999, freezable: false, avgCost: 1.50, unit: "per 500g" },
            { name: "integral rice", category: "carb", fridgeDays: 999, freezable: false, avgCost: 1.80, unit: "per 500g" },
            { name: "small potatoes", category: "carb", fridgeDays: 14, freezable: false, avgCost: 2.00, unit: "per bag" },
            { name: "integral bread", category: "carb", fridgeDays: 5, freezable: true, avgCost: 2.50, unit: "per loaf" },
            { name: "rice cakes", category: "carb", fridgeDays: 999, freezable: false, avgCost: 1.80, unit: "per pack" },
            { name: "zucchini", category: "vegetable", fridgeDays: 5, freezable: false, avgCost: 1.00, unit: "per piece" },
            { name: "frozen poivron", category: "vegetable", fridgeDays: 999, freezable: true, avgCost: 2.50, unit: "per bag" },
            { name: "spinach", category: "vegetable", fridgeDays: 3, freezable: false, avgCost: 1.50, unit: "per bag" },
            { name: "tomatoes", category: "vegetable", fridgeDays: 4, freezable: false, avgCost: 1.50, unit: "per 4 pack" },
            { name: "onion", category: "vegetable", fridgeDays: 30, freezable: false, avgCost: 0.80, unit: "per piece" },
            { name: "canned tomatoes", category: "pantry", fridgeDays: 999, freezable: false, avgCost: 0.90, unit: "per can" },
            { name: "crème fraîche légère", category: "dairy", fridgeDays: 7, freezable: false, avgCost: 1.20, unit: "per pot" },
            { name: "edam slices", category: "dairy", fridgeDays: 10, freezable: false, avgCost: 2.00, unit: "per pack" },
            { name: "mozzarella", category: "dairy", fridgeDays: 3, freezable: false, avgCost: 1.20, unit: "per ball" },
            { name: "olive oil", category: "pantry", fridgeDays: 999, freezable: false, avgCost: 5.00, unit: "per bottle" },
            { name: "garlic", category: "pantry", fridgeDays: 14, freezable: false, avgCost: 0.50, unit: "per bulb" },
            { name: "cumin", category: "spice", fridgeDays: 999, freezable: false, avgCost: 2.00, unit: "per jar" },
            { name: "paprika", category: "spice", fridgeDays: 999, freezable: false, avgCost: 2.00, unit: "per jar" },
            { name: "lemon", category: "fruit", fridgeDays: 14, freezable: false, avgCost: 0.50, unit: "per piece" },
            { name: "thyme", category: "spice", fridgeDays: 7, freezable: false, avgCost: 1.50, unit: "per bunch" }
        ];
    }
}

/**
 * Generate complete weekly plan
 */
function generateWeeklyPlan(startDate) {
    const week = buildWeek(startDate);
    assignMeals(week);
    const shoppingList = generateShoppingList(week);
    const warnings = checkPerishableWarnings(shoppingList, week);
    const budget = getBudgetStatus();

    return {
        week,
        shoppingList,
        warnings,
        budget
    };
}

/**
 * Get the Monday of current week
 */
function getCurrentWeekStart() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// Export for use in HTML
window.GrocerySystem = {
    init: initGrocerySystem,
    generateWeeklyPlan,
    getCurrentWeekStart,
    buildWeek,
    assignMeals,
    generateShoppingList,
    checkPerishableWarnings,
    getBudgetStatus,
    recordExpense,
    get meals() { return meals; },
    get ingredients() { return ingredients; }
};
