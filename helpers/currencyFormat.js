function rupiahFormat(price) {
  // Handle null, undefined, NaN, or non-numeric values
  if (price === null || price === undefined || isNaN(price)) {
    return "Rp 0";
  }

  // Ensure price is a number
  const numPrice = Number(price);
  if (!Number.isFinite(numPrice)) {
    return "Rp 0";
  }

  return numPrice.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });
}
module.exports = { rupiahFormat };
