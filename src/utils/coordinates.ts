/**
 * Compatibility re-exports. Geographic math lives in `lib/geography/coordinates`
 * so Stage 1 hooks keep working without a second copy of the sphere formula.
 */
export {
  cartesianToLatLng,
  latLngToCartesian,
  latLngToCartesianWithAltitude,
  latLngToVector3,
  type CartesianTuple,
} from "@/lib/geography/coordinates";
