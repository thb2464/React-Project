router.post('/orders/:id/confirm', async (req, res) => {
    const { id } = req.params;

    const result = await db.query(
        `UPDATE orders SET order_status = 'preparing' WHERE order_id = $1 RETURNING *`,
        [id]
    );

    res.json(result.rows[0]);
});
