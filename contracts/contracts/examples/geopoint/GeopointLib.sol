pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

library GeopointLib {

    struct Geopoint {
        int32 longitude;  // [-180, 180] ; 7 decimals ; 2 * 180 * (10 ** 7) ; 3.600.000.000 ; int32 range size: 4.294.967.295 - [-2147483648, +2147483647]
        int32 latitude;  // [-90, 90] ; 7 decimals ; 2 * 90 * (10 ** 7)
        uint32 geonamesid;  // ~13mil
        // bytes32 parentId;
        // bytes32[] children;  // e.g. countries have cities
    }

    function insert(Geopoint storage self, Geopoint memory instance) internal {
        self.longitude = instance.longitude;
        self.latitude = instance.latitude;
        self.geonamesid = instance.geonamesid;
    }

    function getDataHash(Geopoint memory instance) pure public returns(bytes32 hash) {
        if (instance.geonamesid != 0) {
            return keccak256(abi.encode(instance.geonamesid));
        }
        return keccak256(abi.encode(instance.longitude, instance.latitude));
    }

    function structureBytes(bytes memory data)
        pure
        public
        returns(Geopoint memory instance)
    {
        (instance) = abi.decode(data, (Geopoint));
    }

    function destructureBytes(Geopoint memory instance)
        pure
        public
        returns(bytes memory data)
    {
        return abi.encode(instance);
    }
}
