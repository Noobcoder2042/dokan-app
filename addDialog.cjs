const fs = require('fs');
const content = fs.readFileSync('src/component/Calculator.jsx', 'utf8');

const historyDialogHtml = `
      <Dialog
        open={Boolean(historyDialogBill)}
        onClose={() => setHistoryDialogBill(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Bill History
          <Typography variant="body2" color="text.secondary">
            ID: {historyDialogBill?.id}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <List>
            {historyDialogBill?.editHistory?.length ? (
              historyDialogBill.editHistory.map((edit, index) => (
                <ListItem key={index} sx={{ borderBottom: index === historyDialogBill.editHistory.length - 1 ? 'none' : '1px solid rgba(226,232,240,0.28)' }}>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>Version {edit.version}</span>
                        <Chip size="small" label={edit.status} variant="outlined" color={edit.status === 'Finalized' ? 'info' : 'warning'} />
                      </Stack>
                    }
                    secondary={\`Edited at: \${new Date(edit.editedAt).toLocaleString('en-IN')} | Items: \${edit.itemCount} | Total: Rs. \${Number(edit.totalAmount || 0).toFixed(2)}\`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
                No edit history available. This bill has only one version.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setHistoryDialogBill(null)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
`;

const newContent = content.replace('</Stack>\n  );\n};', historyDialogHtml + '\n    </Stack>\n  );\n};');

fs.writeFileSync('src/component/Calculator.jsx', newContent);
console.log('Added history dialog');
