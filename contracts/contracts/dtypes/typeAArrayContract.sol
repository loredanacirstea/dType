pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './typeALib.sol';

contract typeAArrayContract {
    using typeALib for typeALib.TypeA;

    address public rootAddress;

    bytes32[] public typeIndex;
    mapping(bytes32 => Type) public typeStruct;

    struct Type {
        typeALib.TypeA[] data;
        uint256 index;
    }

    modifier dataIsStored (bytes32 hash) {
        require(isStored(hash), "No such data inserted.");
        _;
    }

    event LogNew(bytes32 indexed hash, uint256 indexed index);
    event LogUpdate(bytes32 indexed hash, uint256 indexed index);
    event LogRemove(bytes32 indexed hash, uint256 indexed index);

    function setRootAddress(address root) public {
        rootAddress = root;
    }

    function insert(typeALib.TypeA[] memory data) public returns (bytes32 hasho) {

        // for data integrity
        bytes32 hash = keccak256(abi.encode(data));

        if(isStored(hash)) revert("This data exists. Use the extant data.");

        uint256 length = data.length;

        for(uint256 i = 0; i < length; i++) {
            typeStruct[hash].data.push(data[i]);
        }

        typeStruct[hash].index = typeIndex.push(hash) - 1;
        emit LogNew(hash, typeStruct[hash].index);
        return hash;
    }

    function insertBytes(bytes memory data) public returns (bytes32 hasho) {
        return insert(structureBytes(data));
    }

    function remove(bytes32 hash) public returns(uint256 index) {
        if(!isStored(hash)) revert("Not deleted: not extant.");
        uint rowToDelete = typeStruct[hash].index;
        bytes32 keyToMove = typeIndex[typeIndex.length-1];
        typeIndex[rowToDelete] = keyToMove;
        typeStruct[keyToMove].index = rowToDelete;
        typeIndex.length--;
        emit LogRemove(hash, rowToDelete);

        emit LogUpdate(keyToMove, rowToDelete);
        return rowToDelete;
    }

    function update(bytes32 hashi, typeALib.TypeA[] memory data)
        public
        returns(bytes32 hash)
    {
        remove(hashi);
        return insert(data);
    }

    function isStored(bytes32 hash) public view returns(bool isIndeed) {
        if(typeIndex.length == 0) return false;
        return (typeIndex[typeStruct[hash].index] == hash);
    }

    function getByHash(bytes32 hash) public view returns(typeALib.TypeA[] memory data) {
        if(!isStored(hash)) revert("No such data inserted.");
        return(typeStruct[hash].data);
    }

    function count() public view returns(uint256 counter) {
        return typeIndex.length;
    }

    function structureBytes(bytes memory data)
        pure
        internal
        returns(typeALib.TypeA[] memory typeAarr)
    {
        (typeAarr) = abi.decode(data, (typeALib.TypeA[]));
    }
}
