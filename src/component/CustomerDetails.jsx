import { Autocomplete, Grid, TextField } from "@mui/material";

const CustomerDetails = ({
  customerName,
  customerPhone,
  customerAddress,
  customerOptions,
  onNameChange,
  onPhoneChange,
  onAddressChange,
  onCustomerSelect,
}) => {
  const selectedCustomer =
    customerOptions.find(
      (option) =>
        option.name === customerName &&
        option.phoneNumber === customerPhone &&
        (option.address || "") === customerAddress
    ) ||
    customerOptions.find((option) => option.name === customerName) ||
    null;

  return (
    <>
      <Grid item xs={12}>
        <Autocomplete
          freeSolo
          fullWidth
          options={customerOptions}
          value={selectedCustomer}
          inputValue={customerName}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.name || ""
          }
          isOptionEqualToValue={(option, value) =>
            option.name === value.name &&
            option.phoneNumber === value.phoneNumber &&
            (option.address || "") === (value.address || "")
          }
          onInputChange={(_, value, reason) => {
            if (reason === "input") {
              onNameChange(value);
            }
          }}
          onChange={(_, value) => {
            if (typeof value === "string") {
              onNameChange(value);
              return;
            }

            if (value) {
              onCustomerSelect(value);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer Name"
              helperText="Pick an existing customer to auto-fill mobile and address."
              fullWidth
            />
          )}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Customer Phone"
          value={customerPhone}
          onChange={(event) => onPhoneChange(event.target.value)}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="Customer Address"
          value={customerAddress}
          onChange={(event) => onAddressChange(event.target.value)}
          fullWidth
        />
      </Grid>
    </>
  );
};

export default CustomerDetails;
