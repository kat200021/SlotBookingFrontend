const SlotCard = ({ slot, selected, onSelect }) => {
    return (
      <div
        className={`border p-4 rounded-lg cursor-pointer 
          ${selected ? 'bg-blue-500 text-white' : 'bg-white'} 
          hover:shadow-lg transition`}
        onClick={() => onSelect(slot)}
      >
        <p className="text-lg font-medium">{slot.time}</p>
        <p className="text-sm text-gray-500">{slot.available} spots left</p>
      </div>
    );
  };
  
  export default SlotCard;
  