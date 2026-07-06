"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderType = exports.BookingStatus = exports.BookingType = exports.ItineraryItemType = exports.TripStatus = exports.AccessibilityNeeds = exports.HotelClass = exports.TravelStyle = void 0;
__exportStar(require("./chat"), exports);
var TravelStyle;
(function (TravelStyle) {
    TravelStyle["LUXURY"] = "luxury";
    TravelStyle["BUDGET"] = "budget";
    TravelStyle["ADVENTURE"] = "adventure";
    TravelStyle["FAMILY"] = "family";
    TravelStyle["BUSINESS"] = "business";
    TravelStyle["ROMANTIC"] = "romantic";
    TravelStyle["CULTURAL"] = "cultural";
    TravelStyle["NATURE"] = "nature";
})(TravelStyle || (exports.TravelStyle = TravelStyle = {}));
var HotelClass;
(function (HotelClass) {
    HotelClass[HotelClass["ECONOMY"] = 1] = "ECONOMY";
    HotelClass[HotelClass["STANDARD"] = 2] = "STANDARD";
    HotelClass[HotelClass["COMFORT"] = 3] = "COMFORT";
    HotelClass[HotelClass["LUXURY"] = 4] = "LUXURY";
    HotelClass[HotelClass["PREMIUM"] = 5] = "PREMIUM";
})(HotelClass || (exports.HotelClass = HotelClass = {}));
var AccessibilityNeeds;
(function (AccessibilityNeeds) {
    AccessibilityNeeds["WHEELCHAIR"] = "wheelchair";
    AccessibilityNeeds["VISUAL_IMPAIRMENT"] = "visual_impairment";
    AccessibilityNeeds["HEARING_IMPAIRMENT"] = "hearing_impairment";
    AccessibilityNeeds["MOBILITY_ASSISTANCE"] = "mobility_assistance";
})(AccessibilityNeeds || (exports.AccessibilityNeeds = AccessibilityNeeds = {}));
var TripStatus;
(function (TripStatus) {
    TripStatus["DRAFT"] = "draft";
    TripStatus["PENDING_BOOKING"] = "pending_booking";
    TripStatus["CONFIRMED"] = "confirmed";
    TripStatus["CANCELLED"] = "cancelled";
    TripStatus["COMPLETED"] = "completed";
})(TripStatus || (exports.TripStatus = TripStatus = {}));
var ItineraryItemType;
(function (ItineraryItemType) {
    ItineraryItemType["FLIGHT"] = "flight";
    ItineraryItemType["ACCOMMODATION"] = "accommodation";
    ItineraryItemType["ACTIVITY"] = "activity";
    ItineraryItemType["RESTAURANT"] = "restaurant";
    ItineraryItemType["TRANSPORT"] = "transport";
    ItineraryItemType["FREE_TIME"] = "free_time";
})(ItineraryItemType || (exports.ItineraryItemType = ItineraryItemType = {}));
var BookingType;
(function (BookingType) {
    BookingType["FLIGHT"] = "flight";
    BookingType["HOTEL"] = "hotel";
    BookingType["ACTIVITY"] = "activity";
    BookingType["TRANSPORT"] = "transport";
})(BookingType || (exports.BookingType = BookingType = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["HELD"] = "held";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["FAILED"] = "failed";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var ProviderType;
(function (ProviderType) {
    ProviderType["FLIGHT"] = "flight";
    ProviderType["HOTEL"] = "hotel";
    ProviderType["ACTIVITY"] = "activity";
    ProviderType["TRANSPORT"] = "transport";
})(ProviderType || (exports.ProviderType = ProviderType = {}));
//# sourceMappingURL=index.js.map